package io.github.smiley4.strategygame.backend.sessions.list

import io.github.smiley4.ktorswaggerui.dsl.routing.get
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.mdcUserId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.sessions.getUserIdOrThrow
import io.ktor.http.HttpStatusCode
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import org.koin.ktor.ext.inject


fun Route.routeGamesList(): Route {
    val gamesList by inject<GamesList>()
    return get("list") {
        val userId = call.getUserIdOrThrow()
        withLoggingContextAsync(mdcTraceId(), mdcUserId(userId)) {
            val games = gamesList.list(User.Id(userId))
                .map {
                    GameSessionDto(
                        id = it.id.value,
                        name = it.name,
                        creationTimestamp = it.creationTimestamp,
                        currentTurn = it.turn,
                    )
                }
            call.respond(HttpStatusCode.OK, games)
        }
    }
}

data class GameSessionDto(
    val id: String,
    val name: String,
    val creationTimestamp: Long,
    val currentTurn: Int
)
