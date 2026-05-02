package io.github.smiley4.strategygame.platform.match.routing

import io.github.oshai.kotlinlogging.KotlinLogging
import io.github.smiley4.ktorplus.data.Body
import io.github.smiley4.ktorplus.data.HttpStatusCode
import io.github.smiley4.ktorplus.data.Request
import io.github.smiley4.ktorplus.data.Response
import io.github.smiley4.ktorplus.get
import io.github.smiley4.strategygame.platform.match.MatchError
import io.github.smiley4.strategygame.platform.match.MatchService
import io.github.smiley4.strategygame.platform.match.routing.ListMatchesRoute.RouteRequest
import io.github.smiley4.strategygame.platform.match.routing.ListMatchesRoute.RouteResponse
import io.github.smiley4.strategygame.shared.domain.UserId
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
    private val logger = KotlinLogging.logger {}

    fun handle(request: RouteRequest): RouteResponse {
        try {
            val matches = service.listMatches(UserId())
            return RouteResponse.Success(matches.map { it.value.toString() })
        } catch (e: MatchError) {
            logger.warn(e) { "Failed to list matches" }
            return when (e) {
                is MatchError.NotFound -> RouteResponse.InternalError()
                is MatchError.InvalidMatchState -> RouteResponse.InternalError()
                is MatchError.AlreadyMember -> RouteResponse.InternalError()
                is MatchError.GenerateGameFailed -> RouteResponse.InternalError()
                is MatchError.NotAllowed -> RouteResponse.InternalError()
            }
        } catch (e: Exception) {
            logger.warn(e) { "Failed to list matches" }
            return RouteResponse.InternalError()
        }
    }


    @Request
    class RouteRequest

    sealed class RouteResponse {

        @Response(HttpStatusCode.OK, "The matches were successfully retrieved")
        class Success(
            @Body val matches: List<String>
        ) : RouteResponse()


        @Response(HttpStatusCode.INTERNAL_SERVER_ERROR, "An internal error occurred.")
        class InternalError(
            @Body val body: HttpErrorResponse = HttpErrorResponse.internalError()
        ) : RouteResponse()

    }

}