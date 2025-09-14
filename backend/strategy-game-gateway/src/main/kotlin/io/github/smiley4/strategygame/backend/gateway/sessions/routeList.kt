package io.github.smiley4.strategygame.backend.gateway.sessions

import io.github.smiley4.ktorswaggerui.dsl.routing.get
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.mdcUserId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.gateway.getUserIdOrThrow
import io.github.smiley4.strategygame.backend.gateway.sessions.models.GameSessionDto
import io.github.smiley4.strategygame.backend.sessions.ports.provided.ListGames
import io.ktor.http.HttpStatusCode
import io.ktor.server.response.respond
import io.ktor.server.routing.Route

internal object RouteList {

    fun Route.routeList(listGames: ListGames) = get("list", {
        description = "List all games with the user as a participant."
        response {
            HttpStatusCode.OK to {
                body<Array<GameSessionDto>> {
                    description = "the list of games the user has joined."
                }
            }
        }
    }) {
        val userId = call.getUserIdOrThrow()
        withLoggingContextAsync(mdcTraceId(), mdcUserId(userId)) {
            val games = listGames.perform(User.Id(userId))
                .map {
                    GameSessionDto(
                        id = it.id.value,
                        name = it.name,
                        creationTimestamp = it.creationTimestamp,
                        currentTurn = it.turn,
                    )
                }
            call.respond(HttpStatusCode.OK, games)
        }
    }

}
