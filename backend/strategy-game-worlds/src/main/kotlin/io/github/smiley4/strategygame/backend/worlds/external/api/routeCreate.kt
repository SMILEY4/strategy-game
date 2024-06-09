package io.github.smiley4.strategygame.backend.worlds.external.api

import io.github.smiley4.ktorswaggerui.dsl.post
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.mdcUserId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.common.models.ErrorResponse
import io.github.smiley4.strategygame.backend.common.models.bodyErrorResponse
import io.github.smiley4.strategygame.backend.common.utils.getUserIdOrThrow
import io.github.smiley4.strategygame.backend.worldgen.provided.WorldGenSettings
import io.github.smiley4.strategygame.backend.worlds.ports.provided.CreateGame
import io.github.smiley4.strategygame.backend.worlds.ports.provided.JoinGame
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.Route

object RouteCreate {

    private object GameNotFoundResponse : ErrorResponse(
        status = 404,
        title = "Game not found",
        errorCode = "GAME_NOT_FOUND",
        detail = "Game could not be found when trying to join it.",
    )

    private object WorldInitErrorResponse : ErrorResponse(
        status = 500,
        title = "Failed to initialize world",
        errorCode = "WORLD_INIT_ERROR",
        detail = "Failed to initialize game world."
    )

    private object UserAlreadyPlayerResponse : ErrorResponse(
        status = 409,
        title = "User is already player",
        errorCode = "USER_ALREADY_PLAYER",
        detail = "The user has already joined the game."
    )

    fun Route.routeCreate(createGame: CreateGame, joinGame: JoinGame) = post("create", {
        description = "Create and join a new game. Other players can join this game via the returned game-id"
        request {
            queryParameter<String>("name") {
                description = "the name of the game"
                required = true
            }
            queryParameter<String>("seed") {
                description = "the seed for the random-world-generation"
                required = false
            }
        }
        response {
            HttpStatusCode.OK to {
                body<String>()
            }
            HttpStatusCode.NotFound to {
                bodyErrorResponse(GameNotFoundResponse)
            }
            HttpStatusCode.Conflict to {
                bodyErrorResponse(UserAlreadyPlayerResponse)
            }
        }
    }) {
        val userId = call.getUserIdOrThrow()
        withLoggingContextAsync(mdcTraceId(), mdcUserId(userId)) {
            val name: String = call.request.queryParameters["name"]!!
            val seed: String? = call.request.queryParameters["seed"]
            try {
                val gameId = createGame.perform(name, WorldGenSettings.default(seed?.hashCode()))
                joinGame.perform(userId, gameId)
                call.respond(HttpStatusCode.OK, gameId)
            } catch (e: CreateGame.CreateGameError) {
                when (e) {
                    is CreateGame.GameNotFoundError -> call.respond(GameNotFoundResponse)
                    is CreateGame.WorldInitError -> call.respond(WorldInitErrorResponse)
                }
            } catch (e: JoinGame.GameJoinActionErrors) {
                when (e) {
                    is JoinGame.GameNotFoundError -> call.respond(GameNotFoundResponse)
                    is JoinGame.UserAlreadyJoinedError -> call.respond(UserAlreadyPlayerResponse)
                }
            }
        }
    }

}