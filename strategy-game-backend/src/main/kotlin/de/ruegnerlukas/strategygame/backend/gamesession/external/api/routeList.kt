package de.ruegnerlukas.strategygame.backend.gamesession.external.api

import de.ruegnerlukas.strategygame.backend.app.ApiResponse
import de.ruegnerlukas.strategygame.backend.app.getUserIdOrThrow
import de.ruegnerlukas.strategygame.backend.common.logging.mdcTraceId
import de.ruegnerlukas.strategygame.backend.common.logging.mdcUserId
import de.ruegnerlukas.strategygame.backend.common.logging.withLoggingContextAsync
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.ListGames
import io.github.smiley4.ktorswaggerui.dsl.get
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.routing.*

fun Route.routeList(listGames: ListGames) = get("list", {
    description = "List all games with the user as a participant."
    response {
        HttpStatusCode.OK to {
            description = "Successfully listed all games of the user"
            body(Array<String>::class) {
                description = "the list of ids of games the user has joined."
            }
        }
    }
}) {
    val userId = call.getUserIdOrThrow()
    withLoggingContextAsync(mdcTraceId(), mdcUserId(userId)) {
        val gameIds = listGames.perform(userId)
        ApiResponse.respondSuccess(call, gameIds)
    }
}