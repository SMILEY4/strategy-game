package io.github.smiley4.strategygame.platform.match.routing

import io.github.oshai.kotlinlogging.KotlinLogging
import io.github.smiley4.ktorplus.data.Body
import io.github.smiley4.ktorplus.data.HttpStatusCode
import io.github.smiley4.ktorplus.data.PathParameter
import io.github.smiley4.ktorplus.data.Request
import io.github.smiley4.ktorplus.data.Response
import io.github.smiley4.ktorplus.post
import io.github.smiley4.strategygame.platform.match.MatchError
import io.github.smiley4.strategygame.platform.match.MatchService
import io.github.smiley4.strategygame.platform.match.domain.MatchId
import io.github.smiley4.strategygame.platform.match.routing.GenerateGameRoute.RouteRequest
import io.github.smiley4.strategygame.platform.match.routing.GenerateGameRoute.RouteResponse
import io.github.smiley4.strategygame.shared.domain.UserId
import io.github.smiley4.strategygame.shared.utils.HttpErrorResponse
import io.github.smiley4.strategygame.shared.utils.internalError
import io.ktor.server.routing.Route
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import kotlin.uuid.Uuid

internal fun Route.routeGenerateMatch() {
    post<RouteRequest, RouteResponse>("", {
        description = "Generate the actual game for the given match."
    }) { request ->
        GenerateGameRoute.handle(request)
    }
}

private object GenerateGameRoute : KoinComponent {

    private val service by inject<MatchService>()
    private val logger = KotlinLogging.logger {}

    suspend fun handle(request: RouteRequest): RouteResponse {
        try {
            service.generateGame(UserId(), MatchId(Uuid.parse(request.matchId)))
            return RouteResponse.Success()
        } catch (e: MatchError) {
            logger.warn(e) { "Failed to generate game" }
            return when (e) {
                is MatchError.NotFound -> RouteResponse.NotFound()
                is MatchError.InvalidMatchState -> RouteResponse.InvalidMatchState()
                is MatchError.NotAllowed -> RouteResponse.NotAllowed()
                is MatchError.GenerateGameFailed -> RouteResponse.InternalError()
                is MatchError.AlreadyMember -> RouteResponse.InternalError()
            }
        } catch (e: Exception) {
            logger.warn(e) { "Failed to generate game" }
            return RouteResponse.InternalError()
        }
    }


    @Request
    class RouteRequest(
        @PathParameter("matchId") val matchId: String
    )

    sealed class RouteResponse {

        @Response(HttpStatusCode.OK, "The match was successfully created")
        class Success : RouteResponse()


        @Response(HttpStatusCode.NOT_FOUND, "The match with the given id could not be found.")
        class NotFound(
            @Body val body: HttpErrorResponse = HttpErrorResponse(
                status = HttpStatusCode.NOT_FOUND,
                errorCode = "MATCH_NOT_FOUND",
                title = "Match not found",
                detail = "The match with the given id could not be found.",
            )
        ) : RouteResponse()


        @Response(HttpStatusCode.CONFLICT, "The match is in an invalid state.")
        class InvalidMatchState(
            @Body val body: HttpErrorResponse = HttpErrorResponse(
                status = HttpStatusCode.CONFLICT,
                errorCode = "INVALID_MATCH_STATE",
                title = "Invalid match state",
                detail = "The match is in an state in which a game can not be generated anymore.",
            )
        ) : RouteResponse()


        @Response(HttpStatusCode.BAD_REQUEST, "The user is not allowed to generate the game.")
        class NotAllowed(
            @Body val body: HttpErrorResponse = HttpErrorResponse(
                status = HttpStatusCode.BAD_REQUEST,
                errorCode = "NOT_ALLOWED",
                title = "Not Allowed",
                detail = "The user is not allowed to generate the game.",
            )
        ) : RouteResponse()


        @Response(HttpStatusCode.INTERNAL_SERVER_ERROR, "An internal error occurred.")
        class InternalError(
            @Body val body: HttpErrorResponse = HttpErrorResponse.internalError()
        ) : RouteResponse()

    }

}