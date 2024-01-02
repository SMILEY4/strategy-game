package de.ruegnerlukas.strategygame.backend.gameengine.external.api

import de.ruegnerlukas.strategygame.backend.gameengine.external.api.RouteGameState.routeGameState
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.POVBuilder
import io.ktor.server.auth.authenticate
import io.ktor.server.routing.Route
import io.ktor.server.routing.route
import org.koin.ktor.ext.inject

fun Route.routingGameEngine() {
    val povBuilder by inject<POVBuilder>()
    route("game") {
        authenticate("user") {
            routeGameState(povBuilder)
        }
    }
}