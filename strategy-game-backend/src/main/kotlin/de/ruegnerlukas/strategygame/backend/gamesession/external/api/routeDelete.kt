package de.ruegnerlukas.strategygame.backend.gamesession.external.api

import de.ruegnerlukas.strategygame.backend.common.api.ApiResponse
import de.ruegnerlukas.strategygame.backend.common.api.getUserIdOrThrow
import de.ruegnerlukas.strategygame.backend.common.mdcGameId
import de.ruegnerlukas.strategygame.backend.common.mdcTraceId
import de.ruegnerlukas.strategygame.backend.common.mdcUserId
import de.ruegnerlukas.strategygame.backend.common.withLoggingContextAsync
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.DeleteGame
import io.github.smiley4.ktorswaggerui.dsl.delete
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.routing.*

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
        ApiResponse.respondSuccess(call)
    }
}