package io.github.smiley4.strategygame.identity.routing

import io.github.oshai.kotlinlogging.KotlinLogging
import io.github.smiley4.ktorplus.data.Body
import io.github.smiley4.ktorplus.data.HttpStatusCode
import io.github.smiley4.ktorplus.data.Request
import io.github.smiley4.ktorplus.data.Response
import io.github.smiley4.ktorplus.post
import io.github.smiley4.strategygame.identity.auth.AuthError
import io.github.smiley4.strategygame.identity.auth.AuthService
import io.github.smiley4.strategygame.identity.routing.LogInRoute.RouteRequest
import io.github.smiley4.strategygame.identity.routing.LogInRoute.RouteResponse
import io.github.smiley4.strategygame.identity.shared.UnsafePassword
import io.github.smiley4.strategygame.identity.shared.Username
import io.github.smiley4.strategygame.shared.utils.HttpErrorResponse
import io.github.smiley4.strategygame.shared.utils.internalError
import io.ktor.server.routing.Route
import kotlinx.serialization.Serializable
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject


internal fun Route.routeLogIn() {
    post<RouteRequest, RouteResponse>("/login", {
        description = "Log-In with the given credentials."
    }) { request ->
        LogInRoute.handle(request)
    }
}


private object LogInRoute : KoinComponent {

    private val logger = KotlinLogging.logger {}
    private val service by inject<AuthService>()

    fun handle(request: RouteRequest): RouteResponse {
        try {
            val token = service.login(
                Username(request.body.username),
                UnsafePassword(request.body.password),
            )
            return RouteResponse.Success(token.value.toString())
        } catch (e: AuthError) {
            logger.warn(e) { "Failed to log-in" }
            return when (e) {
                is AuthError.InvalidUsernameOrPassword -> RouteResponse.IncorrectUsernameOrPassword()
                is AuthError.InvalidToken -> RouteResponse.InternalError()
            }
        } catch (e: Exception) {
            logger.warn(e) { "Failed to log-in" }
            return RouteResponse.InternalError()
        }
    }


    @Request
    class RouteRequest(
        @Body val body: RequestBody
    ) {

        @Serializable
        data class RequestBody(
            val password: String,
            val username: String
        )

    }

    sealed class RouteResponse {

        @Response(HttpStatusCode.OK, "The user was successfully logged in")
        class Success(
            @Body val token: String
        ) : RouteResponse()


        @Response(HttpStatusCode.BAD_REQUEST, "The provided username or password is incorrect.")
        class IncorrectUsernameOrPassword(
            @Body val body: HttpErrorResponse = HttpErrorResponse(
                status = HttpStatusCode.BAD_REQUEST,
                errorCode = "INCORRECT_USERNAME_OR_PASSWORD",
                title = "Incorrect username or password",
                detail = "The provided username or password is incorrect.",
            )
        ) : RouteResponse()


        @Response(HttpStatusCode.INTERNAL_SERVER_ERROR, "An internal error occurred.")
        class InternalError(
            @Body val body: HttpErrorResponse = HttpErrorResponse.internalError()
        ) : RouteResponse()


    }

}