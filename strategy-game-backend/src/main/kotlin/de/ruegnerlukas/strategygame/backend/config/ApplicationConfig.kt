package de.ruegnerlukas.strategygame.backend.config

import com.fasterxml.jackson.core.util.DefaultIndenter
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter
import com.fasterxml.jackson.databind.SerializationFeature
import de.ruegnerlukas.strategygame.backend.core.actions.gamelobby.GameLobbiesListActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.gamelobby.GameLobbyConnectActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.gamelobby.GameLobbyCreateActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.gamelobby.GameLobbyDisconnectActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.gamelobby.GameLobbyJoinActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.gamelobby.GameLobbyRequestConnectionActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnEndActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnSubmitActionImpl
import de.ruegnerlukas.strategygame.backend.external.api.routing.apiRoutes
import de.ruegnerlukas.strategygame.backend.external.api.websocket.ConnectionHandler
import de.ruegnerlukas.strategygame.backend.external.api.message.producer.GameMessageProducerImpl
import de.ruegnerlukas.strategygame.backend.external.api.message.handler.MessageHandler
import de.ruegnerlukas.strategygame.backend.external.api.websocket.WebSocketMessageProducer
import de.ruegnerlukas.strategygame.backend.external.persistence.InMemoryGameRepository
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService
import de.ruegnerlukas.strategygame.backend.shared.Config
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.serialization.jackson.jackson
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.auth.Authentication
import io.ktor.server.auth.jwt.jwt
import io.ktor.server.plugins.callloging.CallLogging
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.plugins.cors.routing.CORS
import io.ktor.server.request.httpMethod
import io.ktor.server.request.uri
import io.ktor.server.routing.Routing
import io.ktor.server.websocket.WebSockets
import io.ktor.server.websocket.pingPeriod
import io.ktor.server.websocket.timeout
import org.slf4j.event.Level
import java.time.Duration


/**
 * The main-module for configuring Ktor. Referenced in "application.conf".
 */
fun Application.module() {

	val connectionHandler = ConnectionHandler()
	val userIdentityService = UserIdentityService.create(Config.get())
	val messageProducer = GameMessageProducerImpl(WebSocketMessageProducer(connectionHandler))
	val gameRepository = InMemoryGameRepository()

	val gameLobbiesListAction = GameLobbiesListActionImpl(gameRepository)
	val gameLobbyConnectAction = GameLobbyConnectActionImpl(gameRepository, messageProducer)
	val gameLobbyCreateAction = GameLobbyCreateActionImpl(gameRepository)
	val gameLobbyDisconnectAction = GameLobbyDisconnectActionImpl(gameRepository)
	val gameLobbyJoinAction = GameLobbyJoinActionImpl(gameRepository)
	val gameLobbyRequestConnectionAction = GameLobbyRequestConnectionActionImpl(gameRepository)

	val turnEndAction = TurnEndActionImpl(gameRepository, messageProducer)
	val turnSubmitAction = TurnSubmitActionImpl(gameRepository, turnEndAction)

	val messageHandler = MessageHandler(turnSubmitAction)


	install(Routing)
	install(WebSockets) {
		pingPeriod = Duration.ofSeconds(15)
		timeout = Duration.ofSeconds(15)
		maxFrameSize = Long.MAX_VALUE
		masking = false
	}
	install(CallLogging) {
		level = Level.INFO
		format { call ->
			val status = call.response.status()
			val httpMethod = call.request.httpMethod.value
			val route = call.request.uri.replace(Regex("token=.*?(?=(&|\$))"), "token=SECRET")
			"${status.toString()}: $httpMethod - $route"
		}
	}
	install(ContentNegotiation) {
		jackson {
			configure(SerializationFeature.INDENT_OUTPUT, true)
			setDefaultPrettyPrinter(DefaultPrettyPrinter().apply {
				indentArraysWith(DefaultPrettyPrinter.FixedSpaceIndenter.instance)
				indentObjectsWith(DefaultIndenter("  ", "\n"))
			})
		}
	}
	install(CORS) {
		allowMethod(HttpMethod.Options)
		allowMethod(HttpMethod.Put)
		allowMethod(HttpMethod.Delete)
		allowMethod(HttpMethod.Patch)
		allowHeader(HttpHeaders.Authorization)
		allowHeader(HttpHeaders.AccessControlAllowOrigin)
		allowHost("*", listOf("http", "https"))
		allowNonSimpleContentTypes = true
		allowCredentials = true
		allowSameOrigin = true
	}
	install(Authentication) {
		jwt { userIdentityService.configureAuthentication(this) }
	}
	apiRoutes(
		connectionHandler,
		messageHandler,
		userIdentityService,
		gameLobbyCreateAction,
		gameLobbyJoinAction,
		gameLobbiesListAction,
		gameLobbyDisconnectAction,
		gameLobbyRequestConnectionAction,
		gameLobbyConnectAction
	)
}