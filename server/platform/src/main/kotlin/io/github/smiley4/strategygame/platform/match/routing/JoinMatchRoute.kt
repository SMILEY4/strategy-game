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
import io.github.smiley4.strategygame.platform.match.routing.JoinMatchRoute.RouteRequest
import io.github.smiley4.strategygame.platform.match.routing.JoinMatchRoute.RouteResponse
import io.github.smiley4.strategygame.shared.domain.UserId
import io.github.smiley4.strategygame.shared.utils.HttpErrorResponse
import io.github.smiley4.strategygame.shared.utils.internalError
import io.ktor.server.routing.Route
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import kotlin.uuid.Uuid

internal fun Route.routeJoinMatch() {
    post<RouteRequest, RouteResponse>("", {
        description = "Join an existing match."
    }) { request ->
        JoinMatchRoute.handle(request)
    }
}

private object JoinMatchRoute : KoinComponent {

    private val service by inject<MatchService>()
    private val logger = KotlinLogging.logger {}

    suspend fun handle(request: RouteRequest): RouteResponse {
        try {
            service.join(UserId(), MatchId(Uuid.parse(request.matchId)))
            return RouteResponse.Success()
        } catch (e: MatchError) {
            logger.warn(e) { "Failed to join match" }
            return when (e) {
                is MatchError.NotFound -> RouteResponse.NotFound()
                is MatchError.InvalidMatchState -> RouteResponse.InvalidMatchState()
                is MatchError.AlreadyMember -> RouteResponse.AlreadyMember()
                is MatchError.GenerateGameFailed -> RouteResponse.InternalError()
                is MatchError.NotAllowed -> RouteResponse.InternalError()
            }
        } catch (e: Exception) {
            logger.warn(e) { "Failed to join match" }
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
                detail = "The match is in an state in which no user can join anyore.",
            )
        ) : RouteResponse()


        @Response(HttpStatusCode.CONFLICT, "The user is already a member of the match.")
        class AlreadyMember(
            @Body val body: HttpErrorResponse = HttpErrorResponse(
                status = HttpStatusCode.CONFLICT,
                errorCode = "ALREADY_MEMBER",
                title = "Already member",
                detail = "The user is already a member of the match.",
            )
        ) : RouteResponse()


        @Response(HttpStatusCode.INTERNAL_SERVER_ERROR, "An internal error occurred.")
        class InternalError(
            @Body val body: HttpErrorResponse = HttpErrorResponse.internalError()
        ) : RouteResponse()

    }

}