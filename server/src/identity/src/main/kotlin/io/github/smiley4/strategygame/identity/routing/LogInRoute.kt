package io.github.smiley4.strategygame.identity.routing

import io.github.smiley4.ktorplus.data.Body
import io.github.smiley4.ktorplus.data.HttpStatusCode
import io.github.smiley4.ktorplus.data.Request
import io.github.smiley4.ktorplus.data.Response
import io.github.smiley4.ktorplus.post
import io.github.smiley4.strategygame.identity.auth.AuthService
import io.github.smiley4.strategygame.identity.auth.LogInUserError
import io.github.smiley4.strategygame.identity.auth.domain.SessionToken
import io.github.smiley4.strategygame.identity.routing.LogInRoute.RouteRequest
import io.github.smiley4.strategygame.identity.routing.LogInRoute.RouteResponse
import io.github.smiley4.strategygame.identity.routing.LogInRoute.RouteResponse.Success.AuthDataResponse
import io.github.smiley4.strategygame.identity.shared.UnsafePassword
import io.github.smiley4.strategygame.identity.shared.UnsafePasswordError
import io.github.smiley4.strategygame.identity.shared.Username
import io.github.smiley4.strategygame.identity.shared.UsernameError
import io.github.smiley4.strategygame.shared.utils.HttpErrorResponse
import io.github.smiley4.strategygame.shared.utils.internalError
import io.ktor.server.routing.Route
import kotlinx.serialization.Serializable
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject


internal fun Route.routeLogIn() {
    post<RouteRequest, RouteResponse>("", {
        description = "Log-In with the given credentials."
    }) { request ->
        LogInRoute.handle(request)
    }
}


private object LogInRoute : KoinComponent {

    private val service by inject<AuthService>()

    fun handle(request: RouteRequest): RouteResponse {
        try {
            val token = service.login(
                Username(request.body.username),
                UnsafePassword(request.body.password)
            )
            return RouteResponse.Success(AuthDataResponse(token))
        } catch (_: UsernameError) {
            return RouteResponse.IncorrectUsernameOrPassword()
        } catch (_: UnsafePasswordError) {
            return RouteResponse.IncorrectUsernameOrPassword()
        } catch (e: LogInUserError) {
            return when (e) {
                is LogInUserError.InvalidUsernameOrPassword -> RouteResponse.IncorrectUsernameOrPassword()
            }
        } catch (_: Exception) {
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
            @Body val body: AuthDataResponse
        ) : RouteResponse() {

            @Serializable
            data class AuthDataResponse(
                val token: SessionToken
            )

        }


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