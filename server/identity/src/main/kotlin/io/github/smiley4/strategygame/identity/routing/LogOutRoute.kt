package io.github.smiley4.strategygame.identity.routing

import io.github.oshai.kotlinlogging.KotlinLogging
import io.github.smiley4.ktorplus.data.Body
import io.github.smiley4.ktorplus.data.HttpStatusCode
import io.github.smiley4.ktorplus.data.Request
import io.github.smiley4.ktorplus.data.Response
import io.github.smiley4.ktorplus.post
import io.github.smiley4.strategygame.identity.auth.AuthError
import io.github.smiley4.strategygame.identity.auth.AuthService
import io.github.smiley4.strategygame.identity.auth.domain.SessionToken
import io.github.smiley4.strategygame.identity.routing.LogOutRoute.RouteRequest
import io.github.smiley4.strategygame.identity.routing.LogOutRoute.RouteResponse
import io.github.smiley4.strategygame.shared.utils.HttpErrorResponse
import io.github.smiley4.strategygame.shared.utils.internalError
import io.ktor.server.routing.Route
import kotlinx.serialization.Serializable
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import kotlin.uuid.Uuid


internal fun Route.routeLogOut() {
    post<RouteRequest, RouteResponse>("/logout", {
        description = "Log-Out the given session."
    }) { request ->
        LogOutRoute.handle(request)
    }
}


private object LogOutRoute : KoinComponent {

    private val service by inject<AuthService>()
    private val logger = KotlinLogging.logger {}

    fun handle(request: RouteRequest): RouteResponse {
        try {
            service.logout(
                SessionToken(Uuid.parse(request.body.token)),
            )
            return RouteResponse.Success()
        } catch (e: AuthError) {
            logger.warn(e) { "Failed to log-out" }
            return when (e) {
                is AuthError.InvalidToken -> RouteResponse.InvalidToken()
                is AuthError.InvalidUsernameOrPassword -> RouteResponse.InternalError()
            }
        } catch (e: Exception) {
            logger.warn(e) { "Failed to log-out" }
            return RouteResponse.InternalError()
        }
    }


    @Request
    class RouteRequest(
        @Body val body: RequestBody
    ) {

        @Serializable
        data class RequestBody(
            val token: String,
        )

    }

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