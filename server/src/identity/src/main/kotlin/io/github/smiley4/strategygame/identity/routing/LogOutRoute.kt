package io.github.smiley4.strategygame.identity.routing

import io.github.smiley4.ktorplus.data.Body
import io.github.smiley4.ktorplus.data.HttpStatusCode
import io.github.smiley4.ktorplus.data.Request
import io.github.smiley4.ktorplus.data.Response
import io.github.smiley4.ktorplus.post
import io.github.smiley4.strategygame.identity.auth.AuthService
import io.github.smiley4.strategygame.identity.auth.LogOutError
import io.github.smiley4.strategygame.identity.auth.domain.SessionToken
import io.github.smiley4.strategygame.identity.auth.domain.SessionTokenError
import io.github.smiley4.strategygame.identity.routing.LogOutRoute.RouteRequest
import io.github.smiley4.strategygame.identity.routing.LogOutRoute.RouteResponse
import io.github.smiley4.strategygame.shared.infrastructure.AuthenticatedToken
import io.github.smiley4.strategygame.shared.infrastructure.AuthenticatedUserId
import io.github.smiley4.strategygame.shared.utils.HttpErrorResponse
import io.github.smiley4.strategygame.shared.utils.internalError
import io.ktor.server.routing.Route
import kotlinx.serialization.Serializable
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject


internal fun Route.routeLogOut() {
    post<RouteRequest, RouteResponse>("", {
        description = "Log-Out the given session."
    }) { request ->
        LogOutRoute.handle(request)
    }
}


private object LogOutRoute : KoinComponent {

    private val service by inject<AuthService>()

    fun handle(request: RouteRequest): RouteResponse {
        try {
            service.logout(SessionToken(request.token))
            return RouteResponse.Success()
        } catch (_: SessionTokenError) {
            return RouteResponse.InvalidToken()
        } catch (e: LogOutError) {
            return when (e) {
                is LogOutError.InvalidToken -> RouteResponse.InvalidToken()
            }
        } catch (_: Exception) {
            return RouteResponse.InternalError()
        }
    }


    @Request
    class RouteRequest(
        @AuthenticatedToken val token: String,
    )

    sealed class RouteResponse {

        @Response(HttpStatusCode.OK, "The user was successfully logged out")
        class Success : RouteResponse()


        @Response(HttpStatusCode.BAD_REQUEST, "The provided token invalid.")
        class InvalidToken(
            @Body val body: HttpErrorResponse = HttpErrorResponse(
                status = HttpStatusCode.BAD_REQUEST,
                errorCode = "INVALID_TOKEN",
                title = "Invalid token",
                detail = "The provided token is invalid.",
            )
        ) : RouteResponse()


        @Response(HttpStatusCode.INTERNAL_SERVER_ERROR, "An internal error occurred.")
        class InternalError(
            @Body val body: HttpErrorResponse = HttpErrorResponse.internalError()
        ) : RouteResponse()


    }

}