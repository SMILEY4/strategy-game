package io.github.smiley4.strategygame.backend.sessions.services

import io.github.smiley4.ktorplus.data.Body
import io.github.smiley4.ktorplus.data.HttpStatusCode
import io.github.smiley4.ktorplus.data.QueryParameter
import io.github.smiley4.ktorplus.data.Request
import io.github.smiley4.ktorplus.data.Response
import io.github.smiley4.ktorplus.get
import io.github.smiley4.strategygame.backend.common.HttpErrorResponse
import io.github.smiley4.strategygame.backend.common.internalError
import io.github.smiley4.strategygame.backend.common.ktorplus.UserId
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.mdcUserId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.ktor.server.routing.Route
import kotlinx.serialization.Serializable
import mu.two.KotlinLogging
import org.koin.ktor.ext.inject

private val logger = KotlinLogging.logger("route.game-available-movement-positions")

fun Route.routeGameMovementAvailablePositions() {
    val gameServices by inject<GameServices>()
    get<MovementAvailablePositionsRequest, MovementAvailablePositionsResponse>("availablepositions") { request ->
        withLoggingContextAsync(mdcTraceId(), mdcUserId(request.userId.value)) {
            try {
                val targets = gameServices.getAvailableMovementPositions(
                    request.gameId,
                    WorldObject.Id(request.worldObjectId),
                    Tile.Id(request.tileId),
                    request.points
                )
                MovementAvailablePositionsResponse.Success(targets.map {
                    MovementTargetDto(
                        tile = TileRefDto(
                            id = it.tile.id.value,
                            position = TilePositionDto(
                                q = it.tile.position.q,
                                r = it.tile.position.r
                            )
                        ),
                        cost = it.cost
                    )
                })
            } catch (e: GameServicesError) {
                logger.warn(e) { "Could not get available movement positions." }
                when (e) {
                    is GameServicesError.GameNotFoundError -> MovementAvailablePositionsResponse.GameNotFound()
                    is GameServicesError.TileNotFoundError -> MovementAvailablePositionsResponse.TileNotFound()
                    is GameServicesError.WorldObjectNotFoundError -> MovementAvailablePositionsResponse.WorldObjectNotFound()
                }
            } catch (e: Exception) {
                logger.warn(e) { "Could not get available movement positions." }
                MovementAvailablePositionsResponse.InternalError()
            }
        }
    }
}


@Request
private class MovementAvailablePositionsRequest(
    @UserId val userId: User.Id,
    @QueryParameter val gameId: Game.Id,
    @QueryParameter val worldObjectId: String,
    @QueryParameter("pos") val tileId: String,
    @QueryParameter val points: Int
)


private sealed class MovementAvailablePositionsResponse {

    @Response(HttpStatusCode.OK, "Provides the available next movement positions.")
    class Success(
        @Body val body: List<MovementTargetDto>
    ) : MovementAvailablePositionsResponse()


    @Response(HttpStatusCode.NOT_FOUND, "Game not found")
    class GameNotFound(
        @Body val body: HttpErrorResponse = HttpErrorResponse(
            status = HttpStatusCode.NOT_FOUND,
            errorCode = "GAME_NOT_FOUND",
            title = "Game not found",
            detail = "The game could not be found.",
        )
    ) : MovementAvailablePositionsResponse()


    @Response(HttpStatusCode.NOT_FOUND, "Tile not found")
    class TileNotFound(
        @Body val body: HttpErrorResponse = HttpErrorResponse(
            status = HttpStatusCode.NOT_FOUND,
            errorCode = "TILE_NOT_FOUND",
            title = "Tile not found",
            detail = "The tile could not be found.",
        )
    ) : MovementAvailablePositionsResponse()


    @Response(HttpStatusCode.NOT_FOUND, "World Object not found")
    class WorldObjectNotFound(
        @Body val body: HttpErrorResponse = HttpErrorResponse(
            status = HttpStatusCode.NOT_FOUND,
            errorCode = "WORLD_OBJECT_NOT_FOUND",
            title = "World Object not found",
            detail = "The world object could not be found.",
        )
    ) : MovementAvailablePositionsResponse()


    @Response(HttpStatusCode.INTERNAL_SERVER_ERROR, "An internal error occurred.")
    class InternalError(
        @Body val body: HttpErrorResponse = HttpErrorResponse.internalError()
    ) : MovementAvailablePositionsResponse()

}


@Serializable
data class MovementTargetDto(
    val tile: TileRefDto,
    val cost: Int,
)


@Serializable
data class TileRefDto(
    val id: String,
    val position: TilePositionDto
)


@Serializable
data class TilePositionDto(
    val q: Int, val r: Int
)