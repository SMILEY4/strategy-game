package io.github.smiley4.strategygame.backend.worlds.module.api

import io.github.smiley4.ktorswaggerui.dsl.delete
import io.github.smiley4.strategygame.backend.worlds.module.core.provided.DeleteGame
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.Route

object RouteDelete {

    fun Route.routeDelete(deleteGame: DeleteGame) = delete("delete/{gameId}", {
        description = "Delete the given game and all associated data."
        request {
            pathParameter<String>("gameId") {
                description = "The id of the game to delete"
            }
        }
        response {
            HttpStatusCode.OK to {
                description = "Game was successfully deleted."
            }
        }
    }) {
        val gameId = call.parameters["gameId"]!!
        val userId = call.getUserIdOrThrow()
        withLoggingContextAsync(mdcTraceId(), mdcUserId(userId), mdcGameId(gameId)) {
            deleteGame.perform(gameId)
            call.respond(HttpStatusCode.OK, Unit)
        }
    }

}

