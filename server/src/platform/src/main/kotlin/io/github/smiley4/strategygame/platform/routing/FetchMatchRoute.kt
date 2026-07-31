package io.github.smiley4.strategygame.platform.routing

import io.github.smiley4.ktorplus.data.Body
import io.github.smiley4.ktorplus.data.HttpStatusCode
import io.github.smiley4.ktorplus.data.PathParameter
import io.github.smiley4.ktorplus.data.Request
import io.github.smiley4.ktorplus.data.Response
import io.github.smiley4.ktorplus.get
import io.github.smiley4.strategygame.platform.match.GetMatchDetailsError
import io.github.smiley4.strategygame.platform.match.MatchService
import io.github.smiley4.strategygame.platform.routing.FetchMatchRoute.RouteRequest
import io.github.smiley4.strategygame.platform.routing.FetchMatchRoute.RouteResponse
import io.github.smiley4.strategygame.platform.routing.FetchMatchRoute.RouteResponse.Success.MatchDetails
import io.github.smiley4.strategygame.shared.infrastructure.AuthenticatedUserId
import io.github.smiley4.strategygame.shared.utils.HttpErrorResponse
import io.github.smiley4.strategygame.shared.utils.internalError
import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.values.MatchId
import io.github.smiley4.strategygame.shared.values.UserId
import io.ktor.server.routing.Route
import kotlinx.serialization.Serializable
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject

internal fun Route.routeFetchMatch() {
    get<RouteRequest, RouteResponse>("", {
        description = "Get details about a specific match."
    }) { request ->
        FetchMatchRoute.handle(request)
    }
}

private object FetchMatchRoute : KoinComponent {

    private val service by inject<MatchService>()

    fun handle(request: RouteRequest): RouteResponse {
        try {
            val details = service.getMatchDetails(request.userId, request.matchId)
            return RouteResponse.Success(
                MatchDetails(
                    id = details.id,
                    name = details.name,
                    participants = details.participants.map { it.userId },
                    state = details.state.name,
                    gameId = details.gameId,
                )
            )
        } catch (e: GetMatchDetailsError) {
            return when (e) {
                is GetMatchDetailsError.NotFound -> RouteResponse.MatchNotFound()
            }
        } catch (_: Exception) {
            return RouteResponse.InternalError()
        }
    }


    @Request
    class RouteRequest(
        @PathParameter val matchId: MatchId,
        @AuthenticatedUserId val userId: UserId,
    )

    sealed class RouteResponse {

        @Response(HttpStatusCode.OK, "The match was successfully retrieved")
        class Success(
            @Body val body: MatchDetails
        ) : RouteResponse() {

            @Serializable
            data class MatchDetails(
                val id: MatchId,
                val name: String,
                val participants: List<UserId>,
                val state: String,
                val gameId: GameId?
            )

        }


        @Response(HttpStatusCode.NOT_FOUND, "No match with the provided id was found.")
        class MatchNotFound(
            @Body val body: HttpErrorResponse = HttpErrorResponse(
                status = HttpStatusCode.NOT_FOUND,
                errorCode = "NOT_FOUND",
                title = "Not Found",
                detail = "No match with the provided id was found.",
            )
        ) : RouteResponse()


        @Response(HttpStatusCode.INTERNAL_SERVER_ERROR, "An internal error occurred.")
        class InternalError(
            @Body val body: HttpErrorResponse = HttpErrorResponse.internalError()
        ) : RouteResponse()

    }

}