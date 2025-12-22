package io.github.smiley4.strategygame.backend.sessions.create

import io.github.smiley4.ktorswaggerui.dsl.routing.post
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.mdcUserId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.sessions.ErrorResponse
import io.github.smiley4.strategygame.backend.sessions.getUserIdOrThrow
import io.github.smiley4.strategygame.backend.sessions.join.GameJoin
import io.github.smiley4.strategygame.backend.sessions.join.GameJoinError
import io.ktor.http.HttpStatusCode
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import org.koin.ktor.ext.inject

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

private object InitializePlayerErrorResponse : ErrorResponse(
    status = 500,
    title = "Initialize player failed",
    errorCode = "INITIALIZE_PLAYER_ERROR",
    detail = "Failed to initialize the new player."
)

fun Route.routeGameCreate(): Route {
    val gameCreate by inject<GameCreate>()
    val gameJoin by inject<GameJoin>()
    return post("create") {
        val userId = call.getUserIdOrThrow()
        withLoggingContextAsync(mdcTraceId(), mdcUserId(userId)) {
            val name: String = call.request.queryParameters["name"]!!
            val seed: String? = call.request.queryParameters["seed"]
            try {
                val gameId = gameCreate.create(name, seed?.hashCode())
                gameJoin.join(User.Id(userId), gameId)
                call.respond(HttpStatusCode.OK, gameId)
            } catch (e: GameJoinError) {
                when (e) {
                    is GameJoinError.GameNotFoundError -> call.respond(GameNotFoundResponse)
                    is GameJoinError.UserAlreadyJoinedError -> call.respond(UserAlreadyPlayerResponse)
                    is GameJoinError.InitializePlayerError -> call.respond(InitializePlayerErrorResponse)
                }
            }
        }
    }
}