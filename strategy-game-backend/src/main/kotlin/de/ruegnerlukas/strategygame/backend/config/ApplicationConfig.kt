package de.ruegnerlukas.strategygame.backend.config

import de.ruegnerlukas.strategygame.backend.core.actions.CloseConnectionActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.EndTurnAction
import de.ruegnerlukas.strategygame.backend.core.actions.JoinWorldActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.SubmitTurnActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.gamelobby.CreateGameLobbyActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.gamelobby.JoinGameLobbyActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.gamelobby.ListPlayerGameLobbiesActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.gamelobby.RequestConnectGameLobbyActionImpl
import de.ruegnerlukas.strategygame.backend.external.api.routing.apiRoutes
import de.ruegnerlukas.strategygame.backend.external.api.websocket.ConnectionHandler
import de.ruegnerlukas.strategygame.backend.external.api.websocket.MessageHandler
import de.ruegnerlukas.strategygame.backend.external.api.websocket.WebSocketMessageProducer
import de.ruegnerlukas.strategygame.backend.external.persistence.InMemoryGameRepository
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService
import de.ruegnerlukas.strategygame.backend.shared.config.Config
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.serialization.kotlinx.json.json
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
import kotlinx.serialization.json.Json
import org.slf4j.event.Level
import java.time.Duration


/**
 * The main-module for configuring Ktor. Referenced in "application.conf".
 */
fun Application.module() {

	val connectionHandler = ConnectionHandler()
	val messageProducer = WebSocketMessageProducer(connectionHandler)
	val gameRepository = InMemoryGameRepository()
	val endTurnAction = EndTurnAction(messageProducer, gameRepository)
	val joinWorldAction = JoinWorldActionImpl(messageProducer, gameRepository)
	val submitTurnAction = SubmitTurnActionImpl(gameRepository, endTurnAction)
	val createGameLobbyAction = CreateGameLobbyActionImpl(gameRepository)
	val joinGameLobbyAction = JoinGameLobbyActionImpl(gameRepository)
	val listGameLobbiesAction = ListPlayerGameLobbiesActionImpl(gameRepository)
	val requestConnectGameLobbyAction = RequestConnectGameLobbyActionImpl(gameRepository)
	val closeConnectionAction = CloseConnectionActionImpl(gameRepository)
	val messageHandler = MessageHandler(joinWorldAction, submitTurnAction)
	val userIdentityService = UserIdentityService.create(Config.get())

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
		json(Json {
			prettyPrint = true
		})
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
		createGameLobbyAction,
		joinGameLobbyAction,
		listGameLobbiesAction,
		requestConnectGameLobbyAction,
		closeConnectionAction,
		userIdentityService
	)
}