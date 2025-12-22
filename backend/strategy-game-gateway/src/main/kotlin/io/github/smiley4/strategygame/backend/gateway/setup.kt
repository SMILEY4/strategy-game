package io.github.smiley4.strategygame.backend.gateway

import com.fasterxml.jackson.core.util.DefaultIndenter
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter
import com.fasterxml.jackson.databind.SerializationFeature
import io.github.smiley4.ktorswaggerui.SwaggerUI
import io.github.smiley4.ktorswaggerui.data.AuthScheme
import io.github.smiley4.ktorswaggerui.data.AuthType
import io.github.smiley4.ktorswaggerui.routing.openApiSpec
import io.github.smiley4.ktorswaggerui.routing.swaggerUI
import io.github.smiley4.strategygame.backend.common.Config
import io.github.smiley4.strategygame.backend.common.ErrorResponse
import io.github.smiley4.strategygame.backend.gateway.operation.routeHealth
import io.github.smiley4.strategygame.backend.gateway.operation.routeMetrics
import io.github.smiley4.strategygame.backend.gateway.sessions.GatewayGameMessageHandler
import io.github.smiley4.strategygame.backend.gateway.sessions.GatewayGameMessageProducer
import io.github.smiley4.strategygame.backend.common.websocket.auth.WebsocketTicketAuthManager
import io.github.smiley4.strategygame.backend.common.websocket.auth.WebsocketTicketAuthManagerImpl
import io.github.smiley4.strategygame.backend.common.websocket.messages.MessageProducer
import io.github.smiley4.strategygame.backend.common.websocket.messages.WebSocketMessageProducer
import io.github.smiley4.strategygame.backend.common.websocket.session.WebSocketConnectionHandler
import io.github.smiley4.strategygame.backend.sessions.events.GameEventProducer
import io.github.smiley4.strategygame.backend.sessions.routingGameSessions
import io.github.smiley4.strategygame.backend.users.authentication.UserIdentityService
import io.github.smiley4.strategygame.backend.users.routingUser
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.jackson.jackson
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.auth.Authentication
import io.ktor.server.auth.UserIdPrincipal
import io.ktor.server.auth.basic
import io.ktor.server.auth.jwt.jwt
import io.ktor.server.plugins.calllogging.CallLogging
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.plugins.cors.routing.CORS
import io.ktor.server.plugins.statuspages.StatusPages
import io.ktor.server.request.httpMethod
import io.ktor.server.request.path
import io.ktor.server.request.uri
import io.ktor.server.request.userAgent
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import io.ktor.server.websocket.WebSockets
import io.ktor.server.websocket.pingPeriod
import io.ktor.server.websocket.timeout
import io.micrometer.prometheusmetrics.PrometheusMeterRegistry
import mu.two.KotlinLogging
import org.koin.core.module.Module
import org.koin.ktor.ext.inject
import org.slf4j.event.Level
import kotlin.time.Duration.Companion.hours
import kotlin.time.Duration.Companion.seconds

fun Module.dependenciesGateway() {
}

fun Application.ktorGateway() {
    install(WebSockets) {
        pingPeriod = 15.seconds
        timeout = 15.seconds
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
        info {
            title = "Strategy Game API"
            description = "API of the strategy game"
            version = "latest"
        }
        server {
            url = "http://localhost:8080"
            description = "default development server"
        }
        security {
            securityScheme("Auth") {
                type = AuthType.HTTP
                scheme = AuthScheme.BEARER
                bearerFormat = "jwt"
            }
            defaultSecuritySchemeNames("Auth")
        }
        tags {
            tagGenerator = { url -> listOf(url.getOrNull(1)) }
        }
        pathFilter = { _, url -> !(url.lastOrNull()?.let { it.endsWith(".js") || it.endsWith(".css") } ?: false) }
    }
    routing {
        route("swagger") {
            swaggerUI("/api.json")
        }
        route("api.json") {
            openApiSpec()
        }
        routingGateway()
    }
}

private fun Route.routingGateway() {
    val meterRegistry by inject<PrometheusMeterRegistry>()
    route("api") {
        routeHealth()
        routeMetrics(meterRegistry)
        routingUser()
        routingGameSessions()
    }

}