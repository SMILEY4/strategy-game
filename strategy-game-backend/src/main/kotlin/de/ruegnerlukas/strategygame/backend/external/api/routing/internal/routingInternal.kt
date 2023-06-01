package de.ruegnerlukas.strategygame.backend.external.api.routing.internal

import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.DisconnectAllPlayersAction
import io.ktor.server.auth.authenticate
import io.ktor.server.routing.Route
import io.ktor.server.routing.route
import io.micrometer.prometheus.PrometheusMeterRegistry
import org.koin.ktor.ext.inject

fun Route.routingInternal() {
    val meterRegistry by inject<PrometheusMeterRegistry>()
    val actionDisconnectAll by inject<DisconnectAllPlayersAction>()
    routeHealth()
    route("internal") {
        authenticate("auth-technical-user") {
            routeMetrics(meterRegistry)
            routeLogs()
            routeDisconnectAll(actionDisconnectAll)
        }
    }
}
