package io.github.smiley4.strategygame.backend.sessions.join

import io.github.smiley4.ktorswaggerui.dsl.routing.post
import io.github.smiley4.strategygame.backend.common.logging.mdcGameId
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.mdcUserId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.sessions.ErrorResponse
import io.github.smiley4.strategygame.backend.sessions.getUserIdOrThrow
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

fun Route.routeGameJoin(): Route {
    val gameJoin by inject<GameJoin>()
    return post("join/{gameId}") {
        val gameId = call.parameters["gameId"]!!
        val userId = call.getUserIdOrThrow()
        withLoggingContextAsync(mdcTraceId(), mdcUserId(userId), mdcGameId(gameId)) {
            try {
                gameJoin.join(User.Id(userId), Game.Id(gameId))
                call.respond(HttpStatusCode.OK, Unit)
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