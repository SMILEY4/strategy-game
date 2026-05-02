package io.github.smiley4.strategygame.platform.match.routing

import io.github.smiley4.ktorplus.data.Body
import io.github.smiley4.ktorplus.data.HttpStatusCode
import io.github.smiley4.ktorplus.data.Request
import io.github.smiley4.ktorplus.data.Response
import io.github.smiley4.ktorplus.get
import io.github.smiley4.strategygame.platform.match.MatchService
import io.github.smiley4.strategygame.platform.match.domain.MatchId
import io.github.smiley4.strategygame.platform.match.routing.ListMatchesRoute.RouteRequest
import io.github.smiley4.strategygame.platform.match.routing.ListMatchesRoute.RouteResponse
import io.github.smiley4.strategygame.shared.domain.UserId
import io.github.smiley4.strategygame.shared.domain.UserIdError
import io.github.smiley4.strategygame.shared.infrastructure.AuthenticatedUserId
import io.github.smiley4.strategygame.shared.utils.HttpErrorResponse
import io.github.smiley4.strategygame.shared.utils.internalError
import io.ktor.server.routing.Route
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject

internal fun Route.routeListMatches() {
    get<RouteRequest, RouteResponse>("", {
        description = "List the matches of the user."
    }) { request ->
        ListMatchesRoute.handle(request)
    }
}

private object ListMatchesRoute : KoinComponent {

    private val service by inject<MatchService>()

    fun handle(request: RouteRequest): RouteResponse {
        try {
            val matches = service.listMatches(
                UserId(request.userId)
            )
            return RouteResponse.Success(matches)
        } catch (_: UserIdError) {
            return RouteResponse.InvalidUserId()
//      } catch (e: ListMatchesError) {
        } catch (_: Exception) {
            return RouteResponse.InternalError()
        }
    }


    @Request
    class RouteRequest(
        @AuthenticatedUserId val userId: String,
    )

    sealed class RouteResponse {

        @Response(HttpStatusCode.OK, "The matches were successfully retrieved")
        class Success(
            @Body val matches: List<MatchId>
        ) : RouteResponse()


        @Response(HttpStatusCode.BAD_REQUEST, "The provided user id is invalid.")
        class InvalidUserId(
            @Body val body: HttpErrorResponse = HttpErrorResponse(
                status = HttpStatusCode.BAD_REQUEST,
                errorCode = "INVALID_USER_ID",
                title = "Invalid user id",
                detail = "The provided user id is invalid.",
            )
        ) : RouteResponse()


        @Response(HttpStatusCode.INTERNAL_SERVER_ERROR, "An internal error occurred.")
        class InternalError(
            @Body val body: HttpErrorResponse = HttpErrorResponse.internalError()
        ) : RouteResponse()

    }

}