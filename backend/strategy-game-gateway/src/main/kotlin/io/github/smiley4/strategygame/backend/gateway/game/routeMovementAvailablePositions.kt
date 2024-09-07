package io.github.smiley4.strategygame.backend.gateway.game

import io.github.smiley4.ktorswaggerui.dsl.get
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.mdcUserId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.MovementTarget
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.gateway.ErrorResponse
import io.github.smiley4.strategygame.backend.gateway.bodyErrorResponse
import io.github.smiley4.strategygame.backend.gateway.getUserIdOrThrow
import io.github.smiley4.strategygame.backend.worlds.edge.GameService
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.Route

internal object RouteMovementAvailablePositions {

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

    fun Route.routeMovementAvailablePositions(service: GameService) = get("availablepositions", {
        description = "Get the next available positions to move to for the given world-object."
        request {
            queryParameter<String>("gameId") {
                description = "the id of the game"
            }
            queryParameter<String>("worldObjectId") {
                description = "the id of the world object to move"
            }
            queryParameter<String>("pos") {
                description = "the start position to check possible movement destinations from"
            }
        }
        response {
            HttpStatusCode.OK to {
                body<List<MovementTarget>>()
            }
            HttpStatusCode.Unauthorized to {
                bodyErrorResponse(UnauthorizedResponse)
            }
            HttpStatusCode.NotFound to {
                bodyErrorResponse(GameNotFound)
            }
            HttpStatusCode.NotFound to {
                bodyErrorResponse(WorldObjectNotFound)
            }
            HttpStatusCode.NotFound to {
                bodyErrorResponse(PositionNotFound)
            }
        }
    }) {
        val userId = call.getUserIdOrThrow()
        withLoggingContextAsync(mdcTraceId(), mdcUserId(userId)) {
            val gameId = call.parameters["gameId"]!!
            val worldObjectId = call.parameters["worldObjectId"]!!
            val tileId = call.parameters["pos"]!!
            val points = call.parameters["points"]!!.toInt()
            try {
                val targets = service.getAvailableMovementPositions(Game.Id(gameId), WorldObject.Id(worldObjectId), Tile.Id(tileId), points)
                call.respond(HttpStatusCode.OK, targets)
            } catch (e: GameService.GameServiceError) {
                when(e) {
                    is GameService.GameNotFoundError -> call.respond(GameNotFound)
                    is GameService.TileNotFoundError -> call.respond(PositionNotFound)
                    is GameService.WorldObjectNotFoundError -> call.respond(WorldObjectNotFound)
                }
            }
        }
    }

}
