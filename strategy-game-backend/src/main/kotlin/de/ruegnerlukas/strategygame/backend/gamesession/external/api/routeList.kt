package de.ruegnerlukas.strategygame.backend.gamesession.external.api

import de.ruegnerlukas.strategygame.backend.external.api.routing.ApiResponse
import de.ruegnerlukas.strategygame.backend.external.api.routing.getUserIdOrThrow
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GamesListAction
import de.ruegnerlukas.strategygame.backend.shared.mdcTraceId
import de.ruegnerlukas.strategygame.backend.shared.mdcUserId
import de.ruegnerlukas.strategygame.backend.shared.withLoggingContextAsync
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