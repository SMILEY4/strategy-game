package io.github.smiley4.strategygame.backend.app.operation

import io.ktor.server.auth.authenticate
import io.ktor.server.routing.Route
import io.ktor.server.routing.route
import io.micrometer.prometheus.PrometheusMeterRegistry
import org.koin.ktor.ext.inject

fun Route.routingInternal() {
    val meterRegistry by inject<PrometheusMeterRegistry>()
    routeHealth()
    route("internal") {
        authenticate("auth-technical-user") {
            routeMetrics(meterRegistry)
            routeLogs()
        }
    }
}