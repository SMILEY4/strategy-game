package io.github.smiley4.strategygame.platform.routing

import io.github.smiley4.ktorplus.data.Body
import io.github.smiley4.ktorplus.data.HttpStatusCode
import io.github.smiley4.ktorplus.data.Request
import io.github.smiley4.ktorplus.data.Response
import io.github.smiley4.ktorplus.post
import io.github.smiley4.strategygame.platform.match.MatchService
import io.github.smiley4.strategygame.platform.routing.CreateMatchRoute.RouteRequest
import io.github.smiley4.strategygame.platform.routing.CreateMatchRoute.RouteResponse
import io.github.smiley4.strategygame.shared.values.UserId
import io.github.smiley4.strategygame.shared.values.UserIdError
import io.github.smiley4.strategygame.shared.infrastructure.AuthenticatedUserId
import io.github.smiley4.strategygame.shared.utils.HttpErrorResponse
import io.github.smiley4.strategygame.shared.utils.internalError
import io.ktor.server.routing.Route
import kotlinx.serialization.Serializable
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject

internal fun Route.routeCreateMatch() {
    post<RouteRequest, RouteResponse>("", {
        description = "Create a new match."
    }) { request ->
        CreateMatchRoute.handle(request)
    }
}

private object CreateMatchRoute : KoinComponent {

    private val service by inject<MatchService>()

    fun handle(request: RouteRequest): RouteResponse {
        try {
            service.create(
                UserId(request.userId),
                request.body.name
            )
            return RouteResponse.Success()
        } catch (_: UserIdError) {
            return RouteResponse.InvalidUserId()
        } catch (_: Exception) {
            return RouteResponse.InternalError()
        }
    }


    @Request
    class RouteRequest(
        @AuthenticatedUserId val userId: String,
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