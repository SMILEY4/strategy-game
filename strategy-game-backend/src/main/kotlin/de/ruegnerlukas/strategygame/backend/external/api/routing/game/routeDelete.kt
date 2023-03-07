package de.ruegnerlukas.strategygame.backend.external.api.routing.game

import de.ruegnerlukas.strategygame.backend.external.api.routing.ApiResponse
import de.ruegnerlukas.strategygame.backend.external.api.routing.getUserIdOrThrow
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameDeleteAction
import de.ruegnerlukas.strategygame.backend.shared.mdcGameId
import de.ruegnerlukas.strategygame.backend.shared.mdcTraceId
import de.ruegnerlukas.strategygame.backend.shared.mdcUserId
import de.ruegnerlukas.strategygame.backend.shared.withLoggingContextAsync
import io.github.smiley4.ktorswaggerui.dsl.delete
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.routing.Route

fun Route.routeDelete(deleteGame: GameDeleteAction) = delete("delete/{gameId}", {
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