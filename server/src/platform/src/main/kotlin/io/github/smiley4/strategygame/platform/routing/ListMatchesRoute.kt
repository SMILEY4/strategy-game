package io.github.smiley4.strategygame.platform.routing

import io.github.smiley4.ktorplus.data.Body
import io.github.smiley4.ktorplus.data.HttpStatusCode
import io.github.smiley4.ktorplus.data.Request
import io.github.smiley4.ktorplus.data.Response
import io.github.smiley4.ktorplus.get
import io.github.smiley4.strategygame.platform.match.MatchService
import io.github.smiley4.strategygame.platform.routing.ListMatchesRoute.RouteRequest
import io.github.smiley4.strategygame.platform.routing.ListMatchesRoute.RouteResponse
import io.github.smiley4.strategygame.platform.routing.ListMatchesRoute.RouteResponse.Success.MatchListEntry
import io.github.smiley4.strategygame.shared.infrastructure.AuthenticatedUserId
import io.github.smiley4.strategygame.shared.utils.HttpErrorResponse
import io.github.smiley4.strategygame.shared.utils.internalError
import io.github.smiley4.strategygame.shared.values.MatchId
import io.github.smiley4.strategygame.shared.values.UserId
import io.ktor.server.routing.Route
import kotlinx.serialization.Serializable
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
            val matches = service
                .listMatches(request.userId)
                .map {
                    MatchListEntry(
                        id = it.id,
                        name = it.name,
                    )
                }
            return RouteResponse.Success(matches)
        } catch (_: Exception) {
            return RouteResponse.InternalError()
        }
    }


    @Request
    class RouteRequest(
        @AuthenticatedUserId val userId: UserId,
    )

    sealed class RouteResponse {

        @Response(HttpStatusCode.OK, "The matches were successfully retrieved")
        class Success(
            @Body val matches: List<MatchListEntry>
        ) : RouteResponse() {

            @Serializable
            data class MatchListEntry(
                val id: MatchId,
                val name: String,
            )

        }


        @Response(HttpStatusCode.INTERNAL_SERVER_ERROR, "An internal error occurred.")
        class InternalError(
            @Body val body: HttpErrorResponse = HttpErrorResponse.internalError()
        ) : RouteResponse()

    }

}