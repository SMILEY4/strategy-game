package io.github.smiley4.strategygame.backend.sessions.eventstoken

import io.github.smiley4.ktorplus.data.Body
import io.github.smiley4.ktorplus.data.HttpStatusCode
import io.github.smiley4.ktorplus.data.PathParameter
import io.github.smiley4.ktorplus.data.Request
import io.github.smiley4.ktorplus.data.Response
import io.github.smiley4.ktorplus.get
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
import kotlinx.serialization.Serializable
import mu.two.KotlinLogging
import org.koin.ktor.ext.inject

private val logger = KotlinLogging.logger("route.game-events-tokens")

fun Route.routeGameEventsToken() {
    get<EventTokenGetRequest, EventTokenGetResponse>("events/token/{gameId}") { request ->
        val tokenGet by inject<EventsTokenGet>()
        withLoggingContextAsync(mdcTraceId(), mdcUserId(request.userId.value), mdcGameId(request.gameId.value)) {
            try {
                val token = tokenGet.generate(request.userId, request.gameId)
                EventTokenGetResponse.Success(EventsTokenData(token))
            } catch (e: EventsTokenGetError) {
                logger.warn(e) { "Failed to create game event auth token. " }
                when (e) {
                    is EventsTokenGetError.GameNotFoundError -> EventTokenGetResponse.GameNotFound()
                    is EventsTokenGetError.NotParticipantError -> EventTokenGetResponse.NotParticipant()
                }
            } catch (e: Exception) {
                logger.warn(e) { "Failed to create game event auth token. " }
                EventTokenGetResponse.InternalError()
            }
        }
    }
}


@Request
private class EventTokenGetRequest(
    @PathParameter val gameId: Game.Id,
    @UserId val userId: User.Id
)

private sealed class EventTokenGetResponse {

    @Response(HttpStatusCode.OK, "Provides new valid auth token for game events.")
    class Success(
        @Body val body: EventsTokenData
    ) : EventTokenGetResponse()

    @Response(HttpStatusCode.NOT_FOUND, "Game not found")
    class GameNotFound(
        @Body val body: HttpErrorResponse = HttpErrorResponse(
            status = HttpStatusCode.NOT_FOUND,
            errorCode = "GAME_NOT_FOUND",
            title = "Game not found",
            detail = "The game could not be found.",
        )
    ) : EventTokenGetResponse()

    @Response(HttpStatusCode.NOT_FOUND, "User is not a participant")
    class NotParticipant(
        @Body val body: HttpErrorResponse = HttpErrorResponse(
            status = HttpStatusCode.NOT_FOUND,
            errorCode = "NOT_PARTICIPANT",
            title = "Player is not a participant",
            detail = "The user is not a participant of the given game.",
        )
    ) : EventTokenGetResponse()

    @Response(HttpStatusCode.INTERNAL_SERVER_ERROR, "An internal error occurred.")
    class InternalError(
        @Body val body: HttpErrorResponse = HttpErrorResponse.internalError()
    ) : EventTokenGetResponse()
}


@Serializable
data class EventsTokenData(
    val token: String
)