package io.github.smiley4.strategygame.backend.engine.module.external.api

import io.github.smiley4.strategygame.backend.engine.external.api.RouteGameState.routeGameState
import io.github.smiley4.strategygame.backend.engine.ports.provided.POVBuilder
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