package io.github.smiley4.strategygame.platform.match.routing

import io.github.oshai.kotlinlogging.KotlinLogging
import io.github.smiley4.ktorplus.data.Body
import io.github.smiley4.ktorplus.data.HttpStatusCode
import io.github.smiley4.ktorplus.data.Request
import io.github.smiley4.ktorplus.data.Response
import io.github.smiley4.ktorplus.post
import io.github.smiley4.strategygame.platform.match.MatchError
import io.github.smiley4.strategygame.platform.match.MatchService
import io.github.smiley4.strategygame.platform.match.routing.CreateMatchRoute.RouteRequest
import io.github.smiley4.strategygame.platform.match.routing.CreateMatchRoute.RouteResponse
import io.github.smiley4.strategygame.shared.domain.UserId
import io.github.smiley4.strategygame.shared.utils.HttpErrorResponse
import io.github.smiley4.strategygame.shared.utils.internalError
import io.ktor.server.routing.Route
import kotlinx.serialization.Serializable
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject

internal fun Route.routeCreateMatch() {
    post<RouteRequest, RouteResponse>("/match", {
        description = "Create a new match."
    }) { request ->
        CreateMatchRoute.handle(request)
    }
}

private object CreateMatchRoute : KoinComponent {

    private val service by inject<MatchService>()
    private val logger = KotlinLogging.logger {}

    fun handle(request: RouteRequest): RouteResponse {
        try {
            service.create(UserId(), request.body.name)
            return RouteResponse.Success()
        } catch (e: MatchError) {
            logger.warn(e) { "Failed to create match" }
            return when (e) {
                is MatchError.AlreadyMember -> RouteResponse.InternalError()
                is MatchError.GenerateGameFailed -> RouteResponse.InternalError()
                is MatchError.InvalidMatchState -> RouteResponse.InternalError()
                is MatchError.NotAllowed -> RouteResponse.InternalError()
                is MatchError.NotFound -> RouteResponse.InternalError()
            }
        } catch (e: Exception) {
            logger.warn(e) { "Failed to create match" }
            return RouteResponse.InternalError()
        }
    }


    @Request
    class RouteRequest(
        @Body val body: RequestBody
    ) {

        @Serializable
        data class RequestBody(
            val name: String,
        )

    }


    sealed class RouteResponse {

        @Response(HttpStatusCode.OK, "The match was successfully created")
        class Success : RouteResponse()

        @Response(HttpStatusCode.INTERNAL_SERVER_ERROR, "An internal error occurred.")
        class InternalError(
            @Body val body: HttpErrorResponse = HttpErrorResponse.internalError()
        ) : RouteResponse()

    }

}