package de.ruegnerlukas.strategygame.backend.gamesession.external.api

import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.DisconnectAllPlayers
import io.github.smiley4.ktorswaggerui.dsl.post
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.Route

object RouteDisconnectAll {

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
