package io.github.smiley4.strategygame.backend.sessions.join

import io.github.smiley4.ktorplus.data.Body
import io.github.smiley4.ktorplus.data.HttpStatusCode
import io.github.smiley4.ktorplus.data.PathParameter
import io.github.smiley4.ktorplus.data.Request
import io.github.smiley4.ktorplus.data.Response
import io.github.smiley4.ktorplus.post
import io.github.smiley4.strategygame.backend.common.HttpErrorResponse
import io.github.smiley4.strategygame.backend.common.internalError
import io.github.smiley4.strategygame.backend.common.ktorplus.UserId
import io.github.smiley4.strategygame.backend.common.logging.mdcGameId
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.mdcUserId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.User
import io.ktor.server.routing.Route
import mu.two.KotlinLogging
import org.koin.ktor.ext.inject

private val logger = KotlinLogging.logger("route.game-join")

fun Route.routeGameJoin() {
    val gameJoin by inject<GameJoin>()
    post<GameJoinRequest, GameJoinResponse>("join/{gameId}") { request ->
        withLoggingContextAsync(mdcTraceId(), mdcUserId(request.userId.value), mdcGameId(request.gameId.value)) {
            try {
                gameJoin.join(request.userId, request.gameId)
                GameJoinResponse.Success()
            } catch (e: GameJoinError) {
                logger.warn(e) { "Failed to join game." }
                when (e) {
                    is GameJoinError.GameNotFoundError -> GameJoinResponse.GameNotFound()
                    is GameJoinError.UserAlreadyJoinedError -> GameJoinResponse.AlreadyParticipant()
                    is GameJoinError.InitializePlayerError -> GameJoinResponse.InternalError()
                }
            } catch (e: Exception) {
                logger.warn(e) { "Failed to join game." }
                GameJoinResponse.InternalError()
            }
        }
    }
}


@Request
private class GameJoinRequest(
    @PathParameter val gameId: Game.Id,
    @UserId val userId: User.Id
)


private sealed class GameJoinResponse {

    @Response(HttpStatusCode.OK, "The player has joined the game.")
    class Success(
    ) : GameJoinResponse()


    @Response(HttpStatusCode.NOT_FOUND, "Game not found")
    class GameNotFound(
        @Body val body: HttpErrorResponse = HttpErrorResponse(
            status = HttpStatusCode.NOT_FOUND,
            errorCode = "GAME_NOT_FOUND",
            title = "Game not found",
            detail = "The game could not be found.",
        )
    ) : GameJoinResponse()


    @Response(HttpStatusCode.BAD_REQUEST, "User is already a participant")
    class AlreadyParticipant(
        @Body val body: HttpErrorResponse = HttpErrorResponse(
            status = HttpStatusCode.BAD_REQUEST,
            errorCode = "ALREADY_PARTICIPANT",
            title = "Already participant",
            detail = "The user is already a participant of the game.",
        )
    ) : GameJoinResponse()


    @Response(HttpStatusCode.INTERNAL_SERVER_ERROR, "An internal error occurred.")
    class InternalError(
        @Body val body: HttpErrorResponse = HttpErrorResponse.internalError()
    ) : GameJoinResponse()

}
