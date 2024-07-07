package io.github.smiley4.strategygame.backend.gateway.worlds

import io.github.smiley4.ktorswaggerui.dsl.post
import io.github.smiley4.strategygame.backend.worlds.edge.DisconnectAllPlayers
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.Route

internal object RouteDisconnectAll {

    fun Route.routeDisconnectAll(disconnectAll: DisconnectAllPlayers) = post("disconnect/all", {
        description = "Disconnects all connected users from all games  ."
        response {
            HttpStatusCode.OK to {}
        }
    }) {
        disconnectAll.perform()
        call.respond(HttpStatusCode.OK)
    }

}
