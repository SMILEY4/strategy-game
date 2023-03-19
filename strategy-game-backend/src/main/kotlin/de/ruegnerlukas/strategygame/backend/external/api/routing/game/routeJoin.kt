package de.ruegnerlukas.strategygame.backend.external.api.routing.game

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.external.api.routing.ApiResponse
import de.ruegnerlukas.strategygame.backend.external.api.routing.getUserIdOrThrow
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction
import de.ruegnerlukas.strategygame.backend.shared.mdcGameId
import de.ruegnerlukas.strategygame.backend.shared.mdcTraceId
import de.ruegnerlukas.strategygame.backend.shared.mdcUserId
import de.ruegnerlukas.strategygame.backend.shared.withLoggingContextAsync
import io.github.smiley4.ktorswaggerui.dsl.post
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.routing.Route

fun Route.routeJoin(joinGame: GameJoinAction) = post("join/{gameId}", {
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
                example("GameNotFoundError", ApiResponse.failure(GameJoinAction.GameNotFoundError)) {
                    description = "game with given id could not be found."
                }
                example("UserAlreadyPlayerError", ApiResponse.failure(GameJoinAction.UserAlreadyPlayerError)) {
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
                GameJoinAction.GameNotFoundError -> ApiResponse.respondFailure(call, result.value)
                GameJoinAction.UserAlreadyPlayerError -> ApiResponse.respondFailure(call, result.value)
            }
        }
    }
}