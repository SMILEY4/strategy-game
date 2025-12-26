package io.github.smiley4.strategygame.backend.sessions.delete

import io.github.smiley4.ktorplus.data.HttpStatusCode
import io.github.smiley4.ktorplus.data.PathParameter
import io.github.smiley4.ktorplus.data.Request
import io.github.smiley4.ktorplus.data.Response
import io.github.smiley4.ktorplus.delete
import io.github.smiley4.strategygame.backend.common.ktorplus.UserId
import io.github.smiley4.strategygame.backend.common.logging.mdcGameId
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.mdcUserId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.User
import io.ktor.server.routing.Route
import org.koin.ktor.ext.inject

fun Route.routeGameDelete() {
    val gameDelete by inject<GameDelete>()
    delete<GameDeleteRequest, GameDeleteResponse>("delete/{gameId}") { request ->
        withLoggingContextAsync(mdcTraceId(), mdcUserId(request.userId.value), mdcGameId(request.gameId.value)) {
            gameDelete.delete(request.gameId)
            GameDeleteResponse.Success()
        }
    }
}


@Request
private class GameDeleteRequest(
    @PathParameter val gameId: Game.Id,
    @UserId val userId: User.Id
)

private sealed class GameDeleteResponse {

    @Response(HttpStatusCode.OK, "The game has been successfully deleted.")
    class Success(
    ) : GameDeleteResponse()
}
