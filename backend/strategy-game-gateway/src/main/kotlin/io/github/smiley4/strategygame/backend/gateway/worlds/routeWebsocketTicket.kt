package io.github.smiley4.strategygame.backend.gateway.worlds

import io.github.smiley4.ktorwebsocketsextended.routing.webSocketTicket
import io.github.smiley4.strategygame.backend.gateway.worlds.WebsocketConstants.USER_ID
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.routing.Route
import io.ktor.server.routing.route


object RouteWebsocketTicket {

    fun Route.routeWebsocketTicket() = route("/wsticket") {
        webSocketTicket {
            mapOf(USER_ID to it.principal<JWTPrincipal>()?.subject!!)
        }
    }

}