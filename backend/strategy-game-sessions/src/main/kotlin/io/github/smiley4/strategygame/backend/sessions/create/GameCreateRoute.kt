package io.github.smiley4.strategygame.backend.sessions.create

import io.github.smiley4.ktorplus.data.Body
import io.github.smiley4.ktorplus.data.HttpStatusCode
import io.github.smiley4.ktorplus.data.QueryParameter
import io.github.smiley4.ktorplus.data.Request
import io.github.smiley4.ktorplus.data.Response
import io.github.smiley4.ktorplus.post
import io.github.smiley4.strategygame.backend.common.HttpErrorResponse
import io.github.smiley4.strategygame.backend.common.internalError
import io.github.smiley4.strategygame.backend.common.ktorplus.UserId
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.mdcUserId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.sessions.join.GameJoin
import io.github.smiley4.strategygame.backend.sessions.join.GameJoinError
import io.ktor.server.routing.Route
import kotlinx.serialization.Serializable
import mu.two.KotlinLogging
import org.koin.ktor.ext.inject

private val logger = KotlinLogging.logger("route.game-create")

fun Route.routeGameCreate() {
    val gameCreate by inject<GameCreate>()
    val gameJoin by inject<GameJoin>()
    post<GameCreateRequest, GameCreateResponse>("create") { request ->
        withLoggingContextAsync(mdcTraceId(), mdcUserId(request.userId.value)) {
            try {
                val gameId = gameCreate.create(request.name, request.seed?.hashCode())
                gameJoin.join(request.userId, gameId)
                GameCreateResponse.Success(CreatedGameData(gameId.value))
            } catch (e: GameJoinError) {
                logger.warn(e) { "Failed to create game." }
                GameCreateResponse.InternalError()
            } catch (e: Exception) {
                logger.warn(e) { "Failed to create game." }
                GameCreateResponse.InternalError()
            }
        }
    }
}


@Request
private class GameCreateRequest(
    @QueryParameter val name: String,
    @QueryParameter val seed: String?,
    @UserId val userId: User.Id
)


private sealed class GameCreateResponse {

    @Response(HttpStatusCode.OK, "The game has been successfully created.")
    class Success(
        @Body val body: CreatedGameData
    ) : GameCreateResponse()


    @Response(HttpStatusCode.INTERNAL_SERVER_ERROR, "An internal error occurred.")
    class InternalError(
        @Body val body: HttpErrorResponse = HttpErrorResponse.internalError()
    ) : GameCreateResponse()

}


@Serializable
private data class CreatedGameData(
    val gameId: String
)
