package io.github.smiley4.strategygame.backend.worlds.external.api

import io.github.smiley4.ktorswaggerui.dsl.get
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.mdcUserId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.common.utils.getUserIdOrThrow
import io.github.smiley4.strategygame.backend.common.models.GameSessionData
import io.github.smiley4.strategygame.backend.worlds.ports.provided.ListGames
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.Route

object RouteList {

    fun Route.routeList(listGames: ListGames) = get("list", {
        description = "List all games with the user as a participant."
        response {
            HttpStatusCode.OK to {
                body<Array<GameSessionData>> {
                    description = "the list of games the user has joined."
                }
            }
        }
    }) {
        val userId = call.getUserIdOrThrow()
        withLoggingContextAsync(mdcTraceId(), mdcUserId(userId)) {
            val games = listGames.perform(userId)
            call.respond(HttpStatusCode.OK, games)
        }
    }

}
