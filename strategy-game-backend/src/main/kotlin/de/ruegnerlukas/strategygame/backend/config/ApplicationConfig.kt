package de.ruegnerlukas.strategygame.backend.config

import com.fasterxml.jackson.core.util.DefaultIndenter
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter
import com.fasterxml.jackson.databind.SerializationFeature
import de.ruegnerlukas.strategygame.backend.core.actions.game.GamesListActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameConnectActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameCreateActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameDisconnectActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameJoinActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameRequestConnectionActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnEndActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnSubmitActionImpl
import de.ruegnerlukas.strategygame.backend.external.api.message.handler.MessageHandler
import de.ruegnerlukas.strategygame.backend.external.api.message.producer.GameMessageProducerImpl
import de.ruegnerlukas.strategygame.backend.external.api.routing.apiRoutes
import de.ruegnerlukas.strategygame.backend.external.api.websocket.ConnectionHandler
import de.ruegnerlukas.strategygame.backend.external.api.websocket.WebSocketMessageProducer
import de.ruegnerlukas.strategygame.backend.external.persistence.DatabaseProvider
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.game.GameInsertImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.game.GameQueryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.game.GameUpdateTurnImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.game.GamesQueryByUserImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.marker.MarkerInsertMultipleImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.marker.MarkersQueryByGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.order.OrderInsertMultipleImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.order.OrderQueryByGameAndTurnImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayerInsertImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayerQueryByUserAndGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayerQueryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayerUpdateConnectionByUserSetNullImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayerUpdateConnectionImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayerUpdateStateByGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayerUpdateStateImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayersQueryByGameConnectedImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayersQueryByGameStatePlayingImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.tiles.TileInsertMultipleImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.tiles.TileQueryByGameAndPositionImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.tiles.TilesQueryByGameImpl
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
	val gameInsert = GameInsertImpl(database)
	val gameQuery = GameQueryImpl(database)
	val gamesQueryByUser = GamesQueryByUserImpl(database)
	val gameUpdateTurn = GameUpdateTurnImpl(database)
	val markerInsertMultiple = MarkerInsertMultipleImpl(database)
	val markersQueryByGame = MarkersQueryByGameImpl(database)
	val orderInsertMultiple = OrderInsertMultipleImpl(database)
	val orderQueryByGameAndTurn = OrderQueryByGameAndTurnImpl(database)
	val playerInsert = PlayerInsertImpl(database)
	val playerQuery = PlayerQueryImpl(database)
	val playerQueryByUserAndGame = PlayerQueryByUserAndGameImpl(database)
	val playersQueryByGameConnected = PlayersQueryByGameConnectedImpl(database)
	val playersQueryByGameStatePlaying = PlayersQueryByGameStatePlayingImpl(database)
	val playerUpdateConnection = PlayerUpdateConnectionImpl(database)
	val playerUpdateConnectionByUserSetNull = PlayerUpdateConnectionByUserSetNullImpl(database)
	val playerUpdateState = PlayerUpdateStateImpl(database)
	val playerUpdateStateByGame = PlayerUpdateStateByGameImpl(database)
	val tileInsertMultiple = TileInsertMultipleImpl(database)
	val tileQueryByGameAndPosition = TileQueryByGameAndPositionImpl(database)
	val tilesQueryByGame = TilesQueryByGameImpl(database)

	// core actions
	val gamesListAction = GamesListActionImpl(
		gamesQueryByUser
	)
	val gameConnectAction = GameConnectActionImpl(
		playerQueryByUserAndGame,
		playerUpdateConnection,
		tilesQueryByGame,
		markersQueryByGame,
		messageProducer
	)
	val gameCreateAction = GameCreateActionImpl(
		gameInsert,
		playerInsert,
		tileInsertMultiple
	)
	val gameDisconnectAction = GameDisconnectActionImpl(
		playerUpdateConnectionByUserSetNull
	)
	val gameJoinAction = GameJoinActionImpl(
		gameQuery,
		playerInsert,
		playerQueryByUserAndGame
	)
	val gameRequestConnectionAction = GameRequestConnectionActionImpl(
		gameQuery,
		playerQueryByUserAndGame
	)
	val turnEndAction = TurnEndActionImpl(
		gameQuery,
		orderQueryByGameAndTurn,
		playersQueryByGameConnected,
		tilesQueryByGame,
		playerUpdateStateByGame,
		gameUpdateTurn,
		markerInsertMultiple,
		markersQueryByGame,
		messageProducer
	)
	val turnSubmitAction = TurnSubmitActionImpl(
		gameQuery,
		playerQueryByUserAndGame,
		playersQueryByGameStatePlaying,
		tileQueryByGameAndPosition,
		playerUpdateState,
		orderInsertMultiple,
		turnEndAction,
	)

	// misc
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
			KotlinLogging.logger {  }.error("Controller received error", cause)
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