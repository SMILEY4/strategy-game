package de.ruegnerlukas.strategygame.backend.external.api.routing.game

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.external.api.routing.ApiResponse
import de.ruegnerlukas.strategygame.backend.external.api.routing.getUserIdOrThrow
import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameCreateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction
import de.ruegnerlukas.strategygame.backend.shared.mdcTraceId
import de.ruegnerlukas.strategygame.backend.shared.mdcUserId
import de.ruegnerlukas.strategygame.backend.shared.withLoggingContextAsync
import io.github.smiley4.ktorswaggerui.dsl.post
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.routing.Route

fun Route.routeCreate(createGame: GameCreateAction, joinGame: GameJoinAction) = post("create", {
    description = "Create and join a new game. Other players can join this game via the returned game-id"
    request {
        queryParameter<String>("seed") {
            description = "the seed for the random-world-generation"
            required = false
        }
    }
    response {
        HttpStatusCode.OK to {
            description = "Successfully created a new game"
            body(String::class) {
                description = "the id of the created game"
            }
        }
        HttpStatusCode.Conflict to {
            description = "Error during creation of new game."
            body(ApiResponse::class) {
                example("GameNotFoundError", ApiResponse.failure(GameJoinAction.GameNotFoundError)) {
                    description = "Game could not be found when trying to join it."
                }
                example("UserAlreadyPlayerError", ApiResponse.failure(GameJoinAction.UserAlreadyPlayerError)) {
                    description = "The user has already joined the game."
                }
            }
        }
    }
}) {
    val userId = call.getUserIdOrThrow()
    withLoggingContextAsync(mdcTraceId(), mdcUserId(userId)) {
        val seed: String? = call.request.queryParameters["seed"]
        val gameId = createGame.perform(WorldSettings.default(seed?.hashCode()))
        when (val joinResult = joinGame.perform(userId, gameId)) {
            is Either.Right -> ApiResponse.respondSuccess(call, gameId)
            is Either.Left -> when (joinResult.value) {
                GameJoinAction.GameNotFoundError -> ApiResponse.respondFailure(call, joinResult.value)
                GameJoinAction.UserAlreadyPlayerError -> ApiResponse.respondFailure(call, joinResult.value)
            }
        }
    }
}