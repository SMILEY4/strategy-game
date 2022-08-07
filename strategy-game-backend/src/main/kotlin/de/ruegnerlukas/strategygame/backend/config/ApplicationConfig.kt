package de.ruegnerlukas.strategygame.backend.config

import com.fasterxml.jackson.core.util.DefaultIndenter
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter
import com.fasterxml.jackson.databind.SerializationFeature
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolveCommandsActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolveCreateCityCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolvePlaceMarkerCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.BroadcastInitialGameStateActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameConnectActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameCreateActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameDisconnectActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameJoinActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameRequestConnectionActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GamesListActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.BroadcastTurnResultActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnEndActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnSubmitActionImpl
import de.ruegnerlukas.strategygame.backend.external.api.message.handler.MessageHandler
import de.ruegnerlukas.strategygame.backend.external.api.message.producer.GameMessageProducerImpl
import de.ruegnerlukas.strategygame.backend.external.api.routing.apiRoutes
import de.ruegnerlukas.strategygame.backend.external.api.websocket.ConnectionHandler
import de.ruegnerlukas.strategygame.backend.external.api.websocket.WebSocketMessageProducer
import de.ruegnerlukas.strategygame.backend.external.persistence.DatabaseProvider
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.InsertCommandsImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.InsertCountryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.InsertGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryCommandsByGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryCountryByGameAndUserImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryGameExtendedImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryGamesByUserImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.UpdateGameExtendedImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.UpdateGameImpl
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.jackson.jackson
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.auth.Authentication
import io.ktor.server.auth.jwt.jwt
import io.ktor.server.plugins.callloging.CallLogging
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.plugins.cors.routing.CORS
import io.ktor.server.plugins.statuspages.StatusPages
import io.ktor.server.request.httpMethod
import io.ktor.server.request.uri
import io.ktor.server.response.respond
import io.ktor.server.routing.Routing
import io.ktor.server.websocket.WebSockets
import io.ktor.server.websocket.pingPeriod
import io.ktor.server.websocket.timeout
import kotlinx.coroutines.runBlocking
import mu.KotlinLogging
import org.slf4j.event.Level
import java.time.Duration


/**
 * The main-module for configuring Ktor. Referenced in "application.conf".
 */
fun Application.module() {

	// "external" services
	val connectionHandler = ConnectionHandler()
	val userIdentityService = UserIdentityService.create(Config.get())
	val messageProducer = GameMessageProducerImpl(WebSocketMessageProducer(connectionHandler))
	val database = runBlocking { DatabaseProvider.create(Config.get().db) }

	// persistence actions
	val insertCommands = InsertCommandsImpl(database)
	val insertGame = InsertGameImpl(database)
	val queryCommandsByGame = QueryCommandsByGameImpl(database)
	val queryGame = QueryGameImpl(database)
	val queryGamesByUser = QueryGamesByUserImpl(database)
	val queryGameExtended = QueryGameExtendedImpl(database)
	val updateGame = UpdateGameImpl(database)
	val insertCountry = InsertCountryImpl(database)
	val updateGameExtended = UpdateGameExtendedImpl(database)
	val queryCountry = QueryCountryByGameAndUserImpl(database)

	// core actions
	val resolvePlaceMarkerCommandAction = ResolvePlaceMarkerCommandImpl()

	val resolveCreateCityCommandAction = ResolveCreateCityCommandImpl()

	val broadcastTurnResultAction = BroadcastTurnResultActionImpl(
		queryGameExtended,
		messageProducer
	)
	val broadcastInitialGameStateAction = BroadcastInitialGameStateActionImpl(
		queryGameExtended,
		messageProducer
	)
	val gamesListAction = GamesListActionImpl(
		queryGamesByUser
	)
	val gameConnectAction = GameConnectActionImpl(
		queryGame,
		updateGame,
		broadcastInitialGameStateAction
	)
	val gameCreateAction = GameCreateActionImpl(
		insertGame
	)
	val gameDisconnectAction = GameDisconnectActionImpl(
		queryGamesByUser,
		updateGame
	)
	val gameJoinAction = GameJoinActionImpl(
		queryGame,
		updateGame,
		insertCountry
	)
	val gameRequestConnectionAction = GameRequestConnectionActionImpl(
		queryGame,
	)
	val resolveCommandsAction = ResolveCommandsActionImpl(
		queryGameExtended,
		updateGameExtended,
		resolvePlaceMarkerCommandAction,
		resolveCreateCityCommandAction
	)
	val turnEndAction = TurnEndActionImpl(
		resolveCommandsAction,
		broadcastTurnResultAction,
		queryGame,
		updateGame,
		queryCommandsByGame
	)
	val turnSubmitAction = TurnSubmitActionImpl(
		turnEndAction,
		queryGame,
		queryCountry,
		updateGame,
		insertCommands
	)

	// more "external" services
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
	install(StatusPages) {
		exception<Throwable> { call, cause ->
			KotlinLogging.logger { }.error("Controller received error", cause)
			call.respond(HttpStatusCode.InternalServerError, cause::class.qualifiedName ?: "unknown")
		}
	}
	apiRoutes(
		connectionHandler,
		messageHandler,
		userIdentityService,
		gameCreateAction,
		gameJoinAction,
		gamesListAction,
		gameDisconnectAction,
		gameRequestConnectionAction,
		gameConnectAction
	)
}