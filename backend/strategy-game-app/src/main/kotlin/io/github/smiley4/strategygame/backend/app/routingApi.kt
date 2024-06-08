package io.github.smiley4.strategygame.backend.app

import io.github.smiley4.strategygame.backend.app.operation.routeStaticResources
import io.github.smiley4.strategygame.backend.app.operation.routingInternal
import io.github.smiley4.strategygame.backend.engine.external.api.routingGameEngine
import io.github.smiley4.strategygame.backend.users.external.api.routingUser
import io.github.smiley4.strategygame.backend.worlds.external.api.routingGameSession
import io.ktor.server.routing.Route
import io.ktor.server.routing.route

fun Route.routingApi() {
    route("api") {
        routingUser()
        routingGameSession()
        routingGameEngine()
        routingInternal()
    }
    routeStaticResources()
}
