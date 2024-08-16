package io.github.smiley4.strategygame.backend.gateway

import com.fasterxml.jackson.core.util.DefaultIndenter
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter
import com.fasterxml.jackson.databind.SerializationFeature
import io.github.smiley4.ktorswaggerui.SwaggerUI
import io.github.smiley4.ktorswaggerui.dsl.AuthScheme
import io.github.smiley4.ktorswaggerui.dsl.AuthType
import io.github.smiley4.strategygame.backend.common.Config
import io.github.smiley4.strategygame.backend.gateway.game.RouteMovementAvailablePositions.routeMovementAvailablePositions
import io.github.smiley4.strategygame.backend.gateway.game.RouteSettlementName.routeSettlementName
import io.github.smiley4.strategygame.backend.gateway.operation.routeHealth
import io.github.smiley4.strategygame.backend.gateway.operation.routeMetrics
import io.github.smiley4.strategygame.backend.gateway.users.RouteDelete.routeDelete
import io.github.smiley4.strategygame.backend.gateway.users.RouteLogin.routeLogin
import io.github.smiley4.strategygame.backend.gateway.users.RouteRefresh.routeRefresh
import io.github.smiley4.strategygame.backend.gateway.users.RouteSignup.routeSignup
import io.github.smiley4.strategygame.backend.gateway.websocket.auth.WebsocketTicketAuthManager
import io.github.smiley4.strategygame.backend.gateway.websocket.auth.WebsocketTicketAuthManagerImpl
import io.github.smiley4.strategygame.backend.gateway.websocket.messages.MessageProducer
import io.github.smiley4.strategygame.backend.gateway.websocket.messages.WebSocketMessageProducer
import io.github.smiley4.strategygame.backend.gateway.websocket.session.WebSocketConnectionHandler
import io.github.smiley4.strategygame.backend.gateway.worlds.GatewayGameMessageHandler
import io.github.smiley4.strategygame.backend.gateway.worlds.GatewayGameMessageProducer
import io.github.smiley4.strategygame.backend.gateway.worlds.RouteCreate.routeCreate
import io.github.smiley4.strategygame.backend.gateway.worlds.RouteDelete.routeDelete
import io.github.smiley4.strategygame.backend.gateway.worlds.RouteDisconnectAll.routeDisconnectAll
import io.github.smiley4.strategygame.backend.gateway.worlds.RouteJoin.routeJoin
import io.github.smiley4.strategygame.backend.gateway.worlds.RouteList.routeList
import io.github.smiley4.strategygame.backend.gateway.worlds.RouteWebsocket.routeWebsocket
import io.github.smiley4.strategygame.backend.gateway.worlds.RouteWebsocketTicket.routeWebsocketTicket
import io.github.smiley4.strategygame.backend.users.edge.CreateUser
import io.github.smiley4.strategygame.backend.users.edge.DeleteUser
import io.github.smiley4.strategygame.backend.users.edge.LoginUser
import io.github.smiley4.strategygame.backend.users.edge.RefreshUserToken
import io.github.smiley4.strategygame.backend.users.edge.UserIdentityService
import io.github.smiley4.strategygame.backend.worlds.edge.ConnectToGame
import io.github.smiley4.strategygame.backend.worlds.edge.CreateGame
import io.github.smiley4.strategygame.backend.worlds.edge.DeleteGame
import io.github.smiley4.strategygame.backend.worlds.edge.DisconnectAllPlayers
import io.github.smiley4.strategygame.backend.worlds.edge.DisconnectPlayer
import io.github.smiley4.strategygame.backend.worlds.edge.GameMessageProducer
import io.github.smiley4.strategygame.backend.worlds.edge.GameService
import io.github.smiley4.strategygame.backend.worlds.edge.JoinGame
import io.github.smiley4.strategygame.backend.worlds.edge.ListGames
import io.github.smiley4.strategygame.backend.worlds.edge.RequestConnectionToGame
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.jackson.jackson
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.auth.Authentication
import io.ktor.server.auth.UserIdPrincipal
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.basic
import io.ktor.server.auth.jwt.jwt
import io.ktor.server.plugins.callloging.CallLogging
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.plugins.cors.routing.CORS
import io.ktor.server.plugins.statuspages.StatusPages
import io.ktor.server.request.httpMethod
import io.ktor.server.request.path
import io.ktor.server.request.uri
import io.ktor.server.request.userAgent
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.Routing
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import io.ktor.server.websocket.WebSockets
import io.ktor.server.websocket.pingPeriod
import io.ktor.server.websocket.timeout
import io.micrometer.prometheus.PrometheusMeterRegistry
import mu.KotlinLogging
import org.koin.core.module.Module
import org.koin.ktor.ext.inject
import org.slf4j.event.Level
import java.time.Duration
import kotlin.time.Duration.Companion.hours

fun Module.dependenciesGateway() {
    single<WebsocketTicketAuthManager> { WebsocketTicketAuthManagerImpl(12.hours) }
    single<WebSocketConnectionHandler> { WebSocketConnectionHandler() }
    single<MessageProducer> { WebSocketMessageProducer(get()) }
    single<GameMessageProducer> { GatewayGameMessageProducer(get()) }
    single<GatewayGameMessageHandler> { GatewayGameMessageHandler(get()) }
}

fun Application.ktorGateway() {
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
            val route = call.request.uri
                .replace(Regex("token=.*?(?=(&|\$))"), "token=SECRET")
                .replace(Regex("ticket=.*?(?=(&|\$))"), "ticket=SECRET")
            val userAgent = call.request.userAgent() ?: "?"
            "${status.toString()}: $httpMethod - $route     (userAgent=$userAgent)"
        }
        filter { call ->
            listOf("internal/metrics", "api/health").none {
                call.request.path().contains(it)
            }
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
    val userIdentityService by inject<UserIdentityService>()
    install(Authentication) {
        jwt("user") {
            userIdentityService.configureAuthentication(this)
            challenge { _, _ ->
                ErrorResponse.unauthorized().also { response ->
                    call.respond(HttpStatusCode.fromValue(response.status), response)
                }
            }
        }
        basic("auth-technical-user") {
            realm = "strategy-game"
            validate { credentials ->
                val username = Config.get().admin.username
                val password = Config.get().admin.password
                if (credentials.name == username && credentials.password == password) {
                    UserIdPrincipal(credentials.name)
                } else {
                    null
                }
            }
        }
    }
    install(StatusPages) {
        exception<Throwable> { call, cause ->
            KotlinLogging.logger { }.error("Controller received error", cause)
            ErrorResponse.from(cause).also { response ->
                call.respond(HttpStatusCode.fromValue(response.status), response)
            }
        }
    }
    install(SwaggerUI) {
        swagger {
            forwardRoot = false
            swaggerUrl = "/swagger-ui"
            authentication = "auth-technical-user"
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
        generateTags { url -> listOf(url.getOrNull(1)) }
        pathFilter = { _, url -> !(url.lastOrNull()?.let { it.endsWith(".js") || it.endsWith(".css") } ?: false) }
        defaultSecuritySchemeName = "Auth"
        defaultUnauthorizedResponse {
            bodyErrorResponse(ErrorResponse.unauthorized())
        }
    }
    routing {
        routingGateway()
    }
}

private fun Route.routingGateway() {

    route("api") {

        val meterRegistry by inject<PrometheusMeterRegistry>()
        routeHealth()
        routeMetrics(meterRegistry)

        val userCreate by inject<CreateUser>()
        val userLogin by inject<LoginUser>()
        val userRefresh by inject<RefreshUserToken>()
        val userDelete by inject<DeleteUser>()
        route("user") {
            routeLogin(userLogin)
            routeRefresh(userRefresh)
            routeSignup(userCreate)
            authenticate("user") {
                routeDelete(userDelete)
            }
        }

        val wsTicketManager by inject<WebsocketTicketAuthManager>()
        val wsConnectionHandler by inject<WebSocketConnectionHandler>()
        val createGame by inject<CreateGame>()
        val joinGame by inject<JoinGame>()
        val listGames by inject<ListGames>()
        val deleteGame by inject<DeleteGame>()
        val messageHandler by inject<GatewayGameMessageHandler>()
        val disconnectAction by inject<DisconnectPlayer>()
        val requestConnection by inject<RequestConnectionToGame>()
        val connectAction by inject<ConnectToGame>()
        val disconnectAll by inject<DisconnectAllPlayers>()
        route("session") {
            authenticate("user") {
                routeCreate(createGame, joinGame)
                routeJoin(joinGame)
                routeList(listGames)
                routeDelete(deleteGame)
                routeWebsocketTicket(wsTicketManager)
            }
            authenticate("auth-technical-user") {
                routeDisconnectAll(disconnectAll)
            }
            routeWebsocket(wsTicketManager, wsConnectionHandler, messageHandler, disconnectAction, requestConnection, connectAction)
        }

        val gameService by inject<GameService>()
        authenticate("user") {
            route("game") {
                route("movement") {
                    routeMovementAvailablePositions(gameService)
                }
                route("settlement") {
                    routeSettlementName(gameService)
                }
            }
        }

    }

}