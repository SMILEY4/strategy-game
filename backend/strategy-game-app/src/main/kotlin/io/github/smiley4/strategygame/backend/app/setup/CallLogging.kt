package io.github.smiley4.strategygame.backend.app.setup

import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.calllogging.CallLogging
import io.ktor.server.request.httpMethod
import io.ktor.server.request.path
import io.ktor.server.request.uri
import io.ktor.server.request.userAgent
import org.slf4j.event.Level

/**
 * Configure call logging.
 */
fun Application.setupCallLogging() {
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
}