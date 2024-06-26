package io.github.smiley4.strategygame.backend.app

import com.fasterxml.jackson.core.util.DefaultIndenter
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter
import com.fasterxml.jackson.databind.SerializationFeature
import io.github.smiley4.ktorswaggerui.SwaggerUI
import io.github.smiley4.ktorswaggerui.dsl.AuthScheme
import io.github.smiley4.ktorswaggerui.dsl.AuthType
import io.github.smiley4.ktorwebsocketsextended.WebsocketsExtended
import io.github.smiley4.strategygame.backend.common.Config
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.models.ErrorResponse
import io.github.smiley4.strategygame.backend.common.models.bodyErrorResponse
import io.github.smiley4.strategygame.backend.common.monitoring.MicrometerMonitoringService
import io.github.smiley4.strategygame.backend.common.monitoring.MonitoringService
import io.github.smiley4.strategygame.backend.common.utils.toDisplayString
import io.github.smiley4.strategygame.backend.gateway.routingGateway
import io.github.smiley4.strategygame.backend.users.ports.required.UserIdentityService
import io.github.smiley4.strategygame.backend.users.routingUsers
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
import io.ktor.server.metrics.micrometer.MicrometerMetrics
import io.ktor.server.plugins.callloging.CallLogging
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.plugins.cors.routing.CORS
import io.ktor.server.plugins.statuspages.StatusPages
import io.ktor.server.request.httpMethod
import io.ktor.server.request.path
import io.ktor.server.request.uri
import io.ktor.server.request.userAgent
import io.ktor.server.response.respond
import io.ktor.server.routing.Routing
import io.ktor.server.routing.RoutingApplicationCall
import io.ktor.server.routing.routing
import io.ktor.server.websocket.WebSockets
import io.ktor.server.websocket.pingPeriod
import io.ktor.server.websocket.timeout
import io.micrometer.core.instrument.binder.jvm.ClassLoaderMetrics
import io.micrometer.core.instrument.binder.jvm.JvmGcMetrics
import io.micrometer.core.instrument.binder.jvm.JvmMemoryMetrics
import io.micrometer.core.instrument.binder.jvm.JvmThreadMetrics
import io.micrometer.core.instrument.binder.system.FileDescriptorMetrics
import io.micrometer.core.instrument.binder.system.ProcessorMetrics
import io.micrometer.core.instrument.binder.system.UptimeMetrics
import mu.KotlinLogging
import org.koin.core.logger.Logger
import org.koin.core.logger.MESSAGE
import org.koin.ktor.ext.inject
import org.koin.ktor.plugin.Koin
import org.slf4j.event.Level
import java.time.Duration
import kotlin.time.Duration.Companion.seconds

/**
 * The main-module for configuring Ktor. Referenced in "application.conf".
 */
fun Application.module() {

    install(Koin) {
        modules(applicationDependencies)
        logger(object : Logger() {
            val logger = Logging.create("Koin")
            override fun log(level: org.koin.core.logger.Level, msg: MESSAGE) {
                when (level) {
                    org.koin.core.logger.Level.DEBUG -> logger.debug(msg)
                    org.koin.core.logger.Level.INFO -> logger.info(msg)
                    org.koin.core.logger.Level.ERROR -> logger.error(msg)
                    org.koin.core.logger.Level.NONE -> Unit
                }
            }
        })
    }
    install(Routing)
    install(WebSockets) {
        pingPeriod = Duration.ofSeconds(15)
        timeout = Duration.ofSeconds(15)
        maxFrameSize = Long.MAX_VALUE
        masking = false
    }
    install(WebsocketsExtended) {
        ticketTTL = 30.seconds
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
    val monitoring by inject<MonitoringService>()
    if (monitoring is MicrometerMonitoringService) {
        install(MicrometerMetrics) {
            registry = (monitoring as MicrometerMonitoringService).getRegistry()
            meterBinders = listOf(
                ClassLoaderMetrics(),
                JvmMemoryMetrics(),
                JvmGcMetrics(),
                ProcessorMetrics(),
                JvmThreadMetrics(),
                FileDescriptorMetrics(),
                UptimeMetrics()
            )
            timers { call, _ ->
                if (call is RoutingApplicationCall) {
                    tag("route", call.route.toDisplayString())
                }
            }
        }
    }

    routing {
        routingGateway()
    }
}