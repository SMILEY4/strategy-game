package io.github.smiley4.strategygame.backend.sessions.services

import io.github.smiley4.ktorplus.data.Body
import io.github.smiley4.ktorplus.data.HttpStatusCode
import io.github.smiley4.ktorplus.data.Request
import io.github.smiley4.ktorplus.data.Response
import io.github.smiley4.ktorplus.get
import io.github.smiley4.strategygame.backend.common.HttpErrorResponse
import io.github.smiley4.strategygame.backend.common.internalError
import io.github.smiley4.strategygame.backend.common.ktorplus.UserId
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.mdcUserId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.commondata.User
import io.ktor.server.routing.Route
import kotlinx.serialization.Serializable
import mu.two.KotlinLogging
import org.koin.ktor.ext.inject

private val logger = KotlinLogging.logger("route.game-random-settlement-name")

fun Route.routeGameSettlementName() {
    val gameServices by inject<GameServices>()
    get<SettlementNameRequest, SettlementNameResponse>("randomname") { request ->
        withLoggingContextAsync(mdcTraceId(), mdcUserId(request.userId.value)) {
            try {
                val name = gameServices.getRandomSettlementName()
                SettlementNameResponse.Success(SettlementNameDto(name))
            } catch (e: GameServicesError) {
                logger.warn(e) { "Could not get random settlement name." }
                when (e) {
                    is GameServicesError.GameNotFoundError -> SettlementNameResponse.GameNotFound()
                    is GameServicesError.TileNotFoundError -> SettlementNameResponse.TileNotFound()
                    is GameServicesError.WorldObjectNotFoundError -> SettlementNameResponse.WorldObjectNotFound()
                }
            } catch (e: Exception) {
                logger.warn(e) { "Could not get random settlement name." }
                SettlementNameResponse.InternalError()
            }
        }
    }
}


@Request
private class SettlementNameRequest(
    @UserId val userId: User.Id
)


private sealed class SettlementNameResponse {

    @Response(HttpStatusCode.OK, "Provides a random settlement name.")
    class Success(
        @Body val body: SettlementNameDto
    ) : SettlementNameResponse()


    @Response(HttpStatusCode.NOT_FOUND, "Game not found")
    class GameNotFound(
        @Body val body: HttpErrorResponse = HttpErrorResponse(
            status = HttpStatusCode.NOT_FOUND,
            errorCode = "GAME_NOT_FOUND",
            title = "Game not found",
            detail = "The game could not be found.",
        )
    ) : SettlementNameResponse()


    @Response(HttpStatusCode.NOT_FOUND, "Tile not found")
    class TileNotFound(
        @Body val body: HttpErrorResponse = HttpErrorResponse(
            status = HttpStatusCode.NOT_FOUND,
            errorCode = "TILE_NOT_FOUND",
            title = "Tile not found",
            detail = "The tile could not be found.",
        )
    ) : SettlementNameResponse()


    @Response(HttpStatusCode.NOT_FOUND, "World Object not found")
    class WorldObjectNotFound(
        @Body val body: HttpErrorResponse = HttpErrorResponse(
            status = HttpStatusCode.NOT_FOUND,
            errorCode = "WORLD_OBJECT_NOT_FOUND",
            title = "World Object not found",
            detail = "The world object could not be found.",
        )
    ) : SettlementNameResponse()


    @Response(HttpStatusCode.INTERNAL_SERVER_ERROR, "An internal error occurred.")
    class InternalError(
        @Body val body: HttpErrorResponse = HttpErrorResponse.internalError()
    ) : SettlementNameResponse()

}


@Serializable
data class SettlementNameDto(
    val name: String,
)
