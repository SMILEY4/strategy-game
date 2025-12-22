package io.github.smiley4.strategygame.backend.sessions.services

import io.github.smiley4.ktorswaggerui.dsl.routing.get
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.mdcUserId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.sessions.ErrorResponse
import io.github.smiley4.strategygame.backend.sessions.getUserIdOrThrow
import io.ktor.http.HttpStatusCode
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import org.koin.ktor.ext.inject

private object UnauthorizedResponse : ErrorResponse(
    status = 401,
    title = "Unauthorized",
    errorCode = "UNAUTHORIZED",
    detail = "The provided email or password is invalid.",
)

private object GameNotFound : ErrorResponse(
    status = 404,
    title = "Game not found",
    errorCode = "GAME_NOT_FOUND",
    detail = "The game with the given id does not exist."
)

private object WorldObjectNotFound : ErrorResponse(
    status = 404,
    title = "World-Object not found",
    errorCode = "WORLD_OBJECT_NOT_FOUND",
    detail = "The world object with the given id does not exist."
)

private object PositionNotFound : ErrorResponse(
    status = 404,
    title = "Position not found",
    errorCode = "POSITION_NOT_FOUND",
    detail = "The position with the given id does not exist."
)

fun Route.routeGameMovementAvailablePositions(): Route {
    val gameServices by inject<GameServices>()
    return get("availablepositions") {
        val userId = call.getUserIdOrThrow()
        withLoggingContextAsync(mdcTraceId(), mdcUserId(userId)) {
            val gameId = call.parameters["gameId"]!!
            val worldObjectId = call.parameters["worldObjectId"]!!
            val tileId = call.parameters["pos"]!!
            val points = call.parameters["points"]!!.toInt()
            try {
                val targets =
                    gameServices.getAvailableMovementPositions(Game.Id(gameId), WorldObject.Id(worldObjectId), Tile.Id(tileId), points)
                call.respond(HttpStatusCode.OK, targets)
            } catch (e: GameServicesError) {
                when (e) {
                    is GameServicesError.GameNotFoundError -> call.respond(GameNotFound)
                    is GameServicesError.TileNotFoundError -> call.respond(PositionNotFound)
                    is GameServicesError.WorldObjectNotFoundError -> call.respond(WorldObjectNotFound)
                }
            }
        }
    }
}

fun Route.routeGameSettlementName(): Route {
    val gameServices by inject<GameServices>()
    return get("randomname") {
        val userId = call.getUserIdOrThrow()
        withLoggingContextAsync(mdcTraceId(), mdcUserId(userId)) {
            try {
                val name = gameServices.getRandomSettlementName()
                call.respond(HttpStatusCode.OK, RandomNameResponse(name))
            } catch (e: GameServicesError) {
                call.respond(HttpStatusCode.InternalServerError, "")
            }
        }
    }
}


data class RandomNameResponse(
    val name: String
)