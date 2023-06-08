package de.ruegnerlukas.strategygame.backend.operation

import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.DisconnectAllPlayers
import io.ktor.server.auth.authenticate
import io.ktor.server.routing.Route
import io.ktor.server.routing.route
import io.micrometer.prometheus.PrometheusMeterRegistry
import org.koin.ktor.ext.inject

fun Route.routingInternal() {
    val meterRegistry by inject<PrometheusMeterRegistry>()
    val actionDisconnectAll by inject<DisconnectAllPlayers>()
    routeHealth()
    route("internal") {
        authenticate("auth-technical-user") {
            routeMetrics(meterRegistry)
            routeLogs()
            routeDisconnectAll(actionDisconnectAll)
        }
    }
}
