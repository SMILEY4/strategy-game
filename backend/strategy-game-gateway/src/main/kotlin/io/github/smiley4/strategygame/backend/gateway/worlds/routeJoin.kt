package io.github.smiley4.strategygame.backend.gateway.worlds

import io.github.smiley4.ktorswaggerui.dsl.post
import io.github.smiley4.strategygame.backend.common.logging.mdcGameId
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.mdcUserId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.gateway.ErrorResponse
import io.github.smiley4.strategygame.backend.gateway.bodyErrorResponse
import io.github.smiley4.strategygame.backend.gateway.getUserIdOrThrow
import io.github.smiley4.strategygame.backend.worlds.edge.JoinGame
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.Route

object RouteJoin {

    private object GameNotFoundResponse : ErrorResponse(
        status = 404,
        title = "Game not found",
        errorCode = "GAME_NOT_FOUND",
        detail = "Game could not be found when trying to join it.",
    )

    private object UserAlreadyPlayerResponse : ErrorResponse(
        status = 409,
        title = "User is already player",
        errorCode = "USER_ALREADY_PLAYER",
        detail = "The user has already joined the game."
    )

    fun Route.routeJoin(joinGame: JoinGame) = post("join/{gameId}", {
        description = "Join a game as a participant."
        request {
            pathParameter("gameId", String::class) {
                description = "the id of the game to join"
            }
        }
        response {
            HttpStatusCode.OK to {}
            HttpStatusCode.NotFound to {
                bodyErrorResponse(GameNotFoundResponse)
            }
            HttpStatusCode.Conflict to {
                bodyErrorResponse(UserAlreadyPlayerResponse)
            }
        }
    }) {
        val gameId = call.parameters["gameId"]!!
        val userId = call.getUserIdOrThrow()
        withLoggingContextAsync(mdcTraceId(), mdcUserId(userId), mdcGameId(gameId)) {
            try {
                joinGame.perform(userId, gameId)
                call.respond(HttpStatusCode.OK, Unit)
            } catch (e: JoinGame.GameJoinActionErrors) {
                when (e) {
                    is JoinGame.GameNotFoundError -> call.respond(GameNotFoundResponse)
                    is JoinGame.UserAlreadyJoinedError -> call.respond(UserAlreadyPlayerResponse)
                }
            }
        }
    }

}