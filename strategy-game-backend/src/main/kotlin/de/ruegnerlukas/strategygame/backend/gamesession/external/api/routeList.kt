package de.ruegnerlukas.strategygame.backend.gamesession.external.api

import de.ruegnerlukas.strategygame.backend.common.api.ApiResponse
import de.ruegnerlukas.strategygame.backend.common.api.getUserIdOrThrow
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GamesListAction
import de.ruegnerlukas.strategygame.backend.common.mdcTraceId
import de.ruegnerlukas.strategygame.backend.common.mdcUserId
import de.ruegnerlukas.strategygame.backend.common.withLoggingContextAsync
import io.github.smiley4.ktorswaggerui.dsl.get
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.routing.Route

fun Route.routeList(listGames: GamesListAction) = get("list", {
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