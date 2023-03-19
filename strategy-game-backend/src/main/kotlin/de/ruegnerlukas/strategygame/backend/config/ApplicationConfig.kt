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
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnUpdateActionImpl
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.external.api.message.handler.MessageHandler
import de.ruegnerlukas.strategygame.backend.external.api.message.producer.GameMessageProducerImpl
import de.ruegnerlukas.strategygame.backend.external.api.routing.ApiResponse
import de.ruegnerlukas.strategygame.backend.external.api.routing.apiRoutes
import de.ruegnerlukas.strategygame.backend.external.api.websocket.ConnectionHandler
import de.ruegnerlukas.strategygame.backend.external.api.websocket.WebSocketMessageProducer
import de.ruegnerlukas.strategygame.backend.external.persistence.DatabaseProvider
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.CommandsByGameQueryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.CommandsInsertImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.CountryByGameAndUserQueryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.CountryInsertImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.GameExtendedQueryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.GameExtendedUpdateImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.GameInsertImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.GameQueryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.GameUpdateImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.GamesByUserQueryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.ReservationInsertImpl
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService
import io.github.smiley4.ktorswaggerui.AuthScheme
import io.github.smiley4.ktorswaggerui.AuthType
import io.github.smiley4.ktorswaggerui.SwaggerUI
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
    val insertCommands = CommandsInsertImpl(database)
    val insertGame = GameInsertImpl(database)
    val queryCommandsByGame = CommandsByGameQueryImpl(database)
    val queryGame = GameQueryImpl(database)
    val queryGamesByUser = GamesByUserQueryImpl(database)
    val queryGameExtended = GameExtendedQueryImpl(database)
    val updateGame = GameUpdateImpl(database)
    val insertCountry = CountryInsertImpl(database)
    val updateGameExtended = GameExtendedUpdateImpl(database)
    val queryCountry = CountryByGameAndUserQueryImpl(database)
    val insertReservation = ReservationInsertImpl(database)

    // game config
    val gameConfig = GameConfig.default()

    // core actions
    val resolvePlaceMarkerCommandAction = ResolvePlaceMarkerCommandImpl()
    val resolveCreateCityCommandAction = ResolveCreateCityCommandImpl(
        insertReservation,
        gameConfig
    )
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
        resolvePlaceMarkerCommandAction,
        resolveCreateCityCommandAction
    )
    val turnUpdateActionImpl = TurnUpdateActionImpl(
        gameConfig
    )
    val turnEndAction = TurnEndActionImpl(
        resolveCommandsAction,
        broadcastTurnResultAction,
        turnUpdateActionImpl,
        queryGameExtended,
        updateGameExtended,
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
    install(SwaggerUI) {
        defaultUnauthorizedResponse {
            description = "Authentication failed"
            body(ApiResponse::class) {
                example("Unauthorized", ApiResponse.authenticationFailed()) {
                    description = "The provided token is invalid."
                }
            }
        }
        defaultSecuritySchemeName = "Auth"
        automaticTagGenerator = { url -> url.getOrNull(1) }
        swagger {
            forwardRoot = true
            swaggerUrl = "/swagger-ui"
        }
        info {
            title = "Strategy Game API"
            description = "API of the strategy game"
            version = "latest"
        }
        server {
            url = "http://localhost:8080"
            description = "default development server"
        }
        securityScheme("Auth") {
            type = AuthType.HTTP
            scheme = AuthScheme.BEARER
            bearerFormat = "jwt"
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
        gameConnectAction,
        gameConfig
    )
}

