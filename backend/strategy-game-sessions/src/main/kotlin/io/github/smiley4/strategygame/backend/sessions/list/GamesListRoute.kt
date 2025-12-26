package io.github.smiley4.strategygame.backend.sessions.list

import io.github.smiley4.ktorplus.data.Body
import io.github.smiley4.ktorplus.data.HttpStatusCode
import io.github.smiley4.ktorplus.data.Request
import io.github.smiley4.ktorplus.data.Response
import io.github.smiley4.ktorplus.get
import io.github.smiley4.strategygame.backend.common.ktorplus.UserId
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.mdcUserId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.commondata.User
import io.ktor.server.routing.Route
import kotlinx.serialization.Serializable
import org.koin.ktor.ext.inject

fun Route.routeGamesList() {
    val gamesList by inject<GamesList>()
    get<GamesListRequest, GamesListResponse>("list") { request ->
        withLoggingContextAsync(mdcTraceId(), mdcUserId(request.userId.value)) {
            val games = gamesList.list(request.userId).map {
                GameSessionDto(
                    id = it.id.value,
                    name = it.name,
                    creationTimestamp = it.creationTimestamp,
                    currentTurn = it.turn,
                )
            }
            GamesListResponse.Success(games)
        }
    }
}


@Request
private class GamesListRequest(
    @UserId val userId: User.Id
)


private sealed class GamesListResponse {

    @Response(HttpStatusCode.OK, "Lists the games of the user.")
    class Success(
        @Body val body: List<GameSessionDto>,
    ) : GamesListResponse()
}


@Serializable
private data class GameSessionDto(
    val id: String,
    val name: String,
    val creationTimestamp: Long,
    val currentTurn: Int
)
