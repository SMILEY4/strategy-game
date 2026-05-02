package io.github.smiley4.strategygame.platform.match.routing

import io.github.oshai.kotlinlogging.KotlinLogging
import io.github.smiley4.ktorplus.data.Body
import io.github.smiley4.ktorplus.data.HttpStatusCode
import io.github.smiley4.ktorplus.data.PathParameter
import io.github.smiley4.ktorplus.data.Request
import io.github.smiley4.ktorplus.data.Response
import io.github.smiley4.ktorplus.delete
import io.github.smiley4.strategygame.platform.match.MatchError
import io.github.smiley4.strategygame.platform.match.MatchService
import io.github.smiley4.strategygame.platform.match.domain.MatchId
import io.github.smiley4.strategygame.platform.match.routing.DeleteMatchRoute.RouteRequest
import io.github.smiley4.strategygame.platform.match.routing.DeleteMatchRoute.RouteResponse
import io.github.smiley4.strategygame.shared.domain.UserId
import io.github.smiley4.strategygame.shared.infrastructure.AuthenticatedUserId
import io.github.smiley4.strategygame.shared.utils.HttpErrorResponse
import io.github.smiley4.strategygame.shared.utils.internalError
import io.ktor.server.routing.Route
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import kotlin.uuid.Uuid

internal fun Route.routeDeleteMatch() {
    delete<RouteRequest, RouteResponse>("", {
        description = "Delete an existing match."
    }) { request ->
        DeleteMatchRoute.handle(request)
    }
}

private object DeleteMatchRoute : KoinComponent {

    private val service by inject<MatchService>()
    private val logger = KotlinLogging.logger {}

    suspend fun handle(request: RouteRequest): RouteResponse {
        try {
            service.delete(request.userId, request.matchId)
            return RouteResponse.Success()
        } catch (e: MatchError) {
            logger.warn(e) { "Failed to delete match" }
            return when (e) {
                is MatchError.NotFound -> RouteResponse.NotFound()
                is MatchError.NotAllowed -> RouteResponse.NotAllowed()
                is MatchError.InvalidMatchState -> RouteResponse.InternalError()
                is MatchError.AlreadyMember -> RouteResponse.InternalError()
                is MatchError.GenerateGameFailed -> RouteResponse.InternalError()
            }
        } catch (e: Exception) {
            logger.warn(e) { "Failed to delete match" }
            return RouteResponse.InternalError()
        }
    }


    @Request
    class RouteRequest(
        @AuthenticatedUserId val userId: UserId,
        @PathParameter("matchId") val matchId: MatchId
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


        @Response(HttpStatusCode.BAD_REQUEST, "The user is not allowed to delete the match.")
        class NotAllowed(
            @Body val body: HttpErrorResponse = HttpErrorResponse(
                status = HttpStatusCode.BAD_REQUEST,
                errorCode = "NOT_ALLOWED",
                title = "Not allowed",
                detail = "The user is not allowed to delete the match.",
            )
        ) : RouteResponse()


        @Response(HttpStatusCode.INTERNAL_SERVER_ERROR, "An internal error occurred.")
        class InternalError(
            @Body val body: HttpErrorResponse = HttpErrorResponse.internalError()
        ) : RouteResponse()

    }

}