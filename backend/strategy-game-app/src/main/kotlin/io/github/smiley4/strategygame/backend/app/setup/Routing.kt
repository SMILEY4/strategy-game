package io.github.smiley4.strategygame.backend.app.setup

import io.github.smiley4.strategygame.backend.sessions.routingGameSessions
import io.github.smiley4.strategygame.backend.users.routingUser
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import io.micrometer.prometheusmetrics.PrometheusMeterRegistry
import org.koin.ktor.ext.inject

/**
 * Configure all routes.
 */
fun Application.setupRouting() {
    routing {
        route("api") {
            routeHealth()
            routeMetrics()
            routingUser()
            routingGameSessions()
        }
    }
}

fun Route.routeHealth() {
    get("health") {
        call.respond(HttpStatusCode.OK, "Healthy ${System.currentTimeMillis()}")
    }
}

fun Route.routeMetrics() {
    val meterRegistry by inject<PrometheusMeterRegistry>()
    get("metrics") {
        val metrics = meterRegistry.scrape()
        call.respondText { metrics }
    }
}