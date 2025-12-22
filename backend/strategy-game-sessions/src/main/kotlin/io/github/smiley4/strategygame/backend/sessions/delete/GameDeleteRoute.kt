package io.github.smiley4.strategygame.backend.sessions.delete

import io.github.smiley4.ktorswaggerui.dsl.routing.delete
import io.github.smiley4.ktorswaggerui.dsl.routing.post
import io.github.smiley4.strategygame.backend.common.logging.mdcGameId
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.mdcUserId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.sessions.getUserIdOrThrow
import io.ktor.http.HttpStatusCode
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import org.koin.ktor.ext.inject
import kotlin.getValue

fun Route.routeGameDelete(): Route {
    val gameDelete by inject<GameDelete>()
    return delete("delete/{gameId}") {
        val gameId = call.parameters["gameId"]!!
        val userId = call.getUserIdOrThrow()
        withLoggingContextAsync(mdcTraceId(), mdcUserId(userId), mdcGameId(gameId)) {
            gameDelete.delete(Game.Id(gameId))
            call.respond(HttpStatusCode.OK, Unit)
        }
    }
}