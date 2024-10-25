package io.github.smiley4.strategygame.backend.gateway.worlds

import io.github.smiley4.ktorswaggerui.dsl.get
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.mdcUserId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.commondata.GameSessionData
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.gateway.getUserIdOrThrow
import io.github.smiley4.strategygame.backend.gateway.worlds.models.GameSessionDto
import io.github.smiley4.strategygame.backend.worlds.edge.ListGames
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.Route

internal object RouteList {

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
            val games = listGames.perform(User.Id(userId))
                .map {
                    GameSessionDto(
                        id = it.game.value,
                        name = it.name,
                        creationTimestamp = it.creationTimestamp,
                        players = it.players,
                        currentTurn = it.currentTurn,
                    )
                }
            call.respond(HttpStatusCode.OK, games)
        }
    }

}
