package de.ruegnerlukas.strategygame.backend.gamesession.external.api

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.app.ApiResponse
import de.ruegnerlukas.strategygame.backend.app.getUserIdOrThrow
import de.ruegnerlukas.strategygame.backend.common.logging.mdcGameId
import de.ruegnerlukas.strategygame.backend.common.logging.mdcTraceId
import de.ruegnerlukas.strategygame.backend.common.logging.mdcUserId
import de.ruegnerlukas.strategygame.backend.common.logging.withLoggingContextAsync
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.JoinGame
import io.github.smiley4.ktorswaggerui.dsl.post
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.routing.*

fun Route.routeJoin(joinGame: JoinGame) = post("join/{gameId}", {
    description = "Join a game as a participant."
    request {
        pathParameter("gameId", String::class) {
            description = "the id of the game to join"
        }
    }
    response {
        HttpStatusCode.OK to {
            description = "Successfully joined the game"
        }
        HttpStatusCode.Conflict to {
            description = "Error when joining the game."
            body(ApiResponse::class) {
                example("GameNotFoundError", ApiResponse.failure(JoinGame.GameNotFoundError)) {
                    description = "game with given id could not be found."
                }
                example("UserAlreadyPlayerError", ApiResponse.failure(JoinGame.UserAlreadyJoinedError)) {
                    description = "The user has already joined the game."
                }
            }
        }
    }
}) {
    val gameId = call.parameters["gameId"]!!
    val userId = call.getUserIdOrThrow()
    withLoggingContextAsync(mdcTraceId(), mdcUserId(userId), mdcGameId(gameId)) {
        when (val result = joinGame.perform(userId, gameId)) {
            is Either.Right -> ApiResponse.respondSuccess(call)
            is Either.Left -> when (result.value) {
                JoinGame.GameNotFoundError -> ApiResponse.respondFailure(call, result.value)
                JoinGame.UserAlreadyJoinedError -> ApiResponse.respondFailure(call, result.value)
            }
        }
    }
}