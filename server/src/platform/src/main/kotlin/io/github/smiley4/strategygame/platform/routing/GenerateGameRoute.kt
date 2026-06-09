package io.github.smiley4.strategygame.platform.routing

import io.github.smiley4.ktorplus.data.Body
import io.github.smiley4.ktorplus.data.HttpStatusCode
import io.github.smiley4.ktorplus.data.PathParameter
import io.github.smiley4.ktorplus.data.Request
import io.github.smiley4.ktorplus.data.Response
import io.github.smiley4.ktorplus.post
import io.github.smiley4.strategygame.platform.match.GenerateGameError
import io.github.smiley4.strategygame.platform.match.MatchService
import io.github.smiley4.strategygame.platform.match.domain.MatchId
import io.github.smiley4.strategygame.platform.match.domain.MatchIdError
import io.github.smiley4.strategygame.platform.routing.GenerateGameRoute.RouteRequest
import io.github.smiley4.strategygame.platform.routing.GenerateGameRoute.RouteResponse
import io.github.smiley4.strategygame.shared.domain.UserId
import io.github.smiley4.strategygame.shared.domain.UserIdError
import io.github.smiley4.strategygame.shared.infrastructure.AuthenticatedUserId
import io.github.smiley4.strategygame.shared.utils.HttpErrorResponse
import io.github.smiley4.strategygame.shared.utils.internalError
import io.ktor.server.routing.Route
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject

internal fun Route.routeGenerateMatch() {
    post<RouteRequest, RouteResponse>("", {
        description = "Generate the actual game for the given match."
    }) { request ->
        GenerateGameRoute.handle(request)
    }
}

private object GenerateGameRoute : KoinComponent {

    private val service by inject<MatchService>()

    suspend fun handle(request: RouteRequest): RouteResponse {
        try {
            service.generateGame(
                UserId(request.userId),
                MatchId(request.matchId)
            )
            return RouteResponse.Success()
        } catch (_: UserIdError) {
            return RouteResponse.InvalidUserId()
        } catch (_: MatchIdError) {
            return RouteResponse.InvalidMatchId()
        } catch (e: GenerateGameError) {
            return when(e) {
                is GenerateGameError.NotAllowed -> RouteResponse.NotAllowed()
                is GenerateGameError.NotFound -> RouteResponse.NotFound()
                is GenerateGameError.WrongMatchState -> RouteResponse.WrongMatchState()
            }
        } catch (e: Exception) {
            return RouteResponse.InternalError()
        }
    }


    @Request
    class RouteRequest(
        @AuthenticatedUserId val userId: String,
        @PathParameter("matchId") val matchId: String
    )

    sealed class RouteResponse {

        @Response(HttpStatusCode.OK, "The match was successfully created")
        class Success : RouteResponse()

        @Response(HttpStatusCode.BAD_REQUEST, "The provided user id is invalid.")
        class InvalidUserId(
            @Body val body: HttpErrorResponse = HttpErrorResponse(
                status = HttpStatusCode.BAD_REQUEST,
                errorCode = "INVALID_USER_ID",
                title = "Invalid user id",
                detail = "The provided user id is invalid.",
            )
        ) : RouteResponse()


        @Response(HttpStatusCode.BAD_REQUEST, "The provided match id is invalid.")
        class InvalidMatchId(
            @Body val body: HttpErrorResponse = HttpErrorResponse(
                status = HttpStatusCode.BAD_REQUEST,
                errorCode = "INVALID_MATCH_ID",
                title = "Invalid match id",
                detail = "The provided match id is invalid.",
            )
        ) : RouteResponse()

        @Response(HttpStatusCode.NOT_FOUND, "The match with the given id could not be found.")
        class NotFound(
            @Body val body: HttpErrorResponse = HttpErrorResponse(
                status = HttpStatusCode.NOT_FOUND,
                errorCode = "MATCH_NOT_FOUND",
                title = "Match not found",
                detail = "The match with the given id could not be found.",
            )
        ) : RouteResponse()


        @Response(HttpStatusCode.CONFLICT, "The match is in the wrong state.")
        class WrongMatchState(
            @Body val body: HttpErrorResponse = HttpErrorResponse(
                status = HttpStatusCode.CONFLICT,
                errorCode = "WRONG_MATCH_STATE",
                title = "Wrong match state",
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