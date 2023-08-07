package de.ruegnerlukas.strategygame.backend.gamesession.external.api

import de.ruegnerlukas.strategygame.backend.app.getUserIdOrThrow
import de.ruegnerlukas.strategygame.backend.common.logging.mdcGameId
import de.ruegnerlukas.strategygame.backend.common.logging.mdcTraceId
import de.ruegnerlukas.strategygame.backend.common.logging.mdcUserId
import de.ruegnerlukas.strategygame.backend.common.logging.withLoggingContextAsync
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.DeleteGame
import io.github.smiley4.ktorswaggerui.dsl.delete
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

