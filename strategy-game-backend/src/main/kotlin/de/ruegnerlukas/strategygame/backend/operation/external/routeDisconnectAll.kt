package de.ruegnerlukas.strategygame.backend.operation.external

import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.DisconnectAllPlayersAction
import io.github.smiley4.ktorswaggerui.dsl.post
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.Route

fun Route.routeDisconnectAll(disconnectAll: DisconnectAllPlayersAction) = post("disconnect/all", {
    description = "Disconnects all connected users from all games  ."
    response {
        HttpStatusCode.OK to {
            description = "Action was performed successfully"
        }
    }
}) {
    disconnectAll.perform()
    call.respond(HttpStatusCode.OK)
}