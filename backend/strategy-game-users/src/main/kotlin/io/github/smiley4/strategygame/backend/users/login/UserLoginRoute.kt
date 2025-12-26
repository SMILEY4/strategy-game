package io.github.smiley4.strategygame.backend.users.login

import io.github.smiley4.ktorplus.data.Body
import io.github.smiley4.ktorplus.data.HttpStatusCode
import io.github.smiley4.ktorplus.data.Request
import io.github.smiley4.ktorplus.data.Response
import io.github.smiley4.ktorplus.post
import io.github.smiley4.strategygame.backend.common.HttpErrorResponse
import io.github.smiley4.strategygame.backend.common.internalError
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.common.unauthorized
import io.ktor.server.routing.Route
import kotlinx.serialization.Serializable
import mu.two.KotlinLogging
import org.koin.ktor.ext.inject

private val logger = KotlinLogging.logger("route.user-login")

fun Route.routeUserLogin() {
    val userLogin by inject<UserLogin>()
    post<UserLoginRequest, UserLoginResponse>("login") { request ->
        withLoggingContextAsync(mdcTraceId()) {
            try {
                val auth = userLogin.login(request.body.email, request.body.password)
                UserLoginResponse.Success(AuthData(auth.idToken, auth.refreshToken))
            } catch (e: UserLoginError) {
                logger.warn(e) { "Failed to log in user." }
                when (e) {
                    is UserLoginError.UserNotFoundError -> UserLoginResponse.UserNotFound()
                    is UserLoginError.UserNotConfirmedError -> UserLoginResponse.UserNotConfirmed()
                    is UserLoginError.NotAuthorizedError -> UserLoginResponse.Unauthorized()
                }
            } catch (e: Exception) {
                logger.warn(e) { "Failed to log in user." }
                UserLoginResponse.InternalError()
            }
        }
    }
}


@Request
private class UserLoginRequest(
    @Body val body: LoginData
)

private sealed class UserLoginResponse {

    @Response(HttpStatusCode.OK, "The user successfully logged in.")
    class Success(
        @Body val body: AuthData
    ) : UserLoginResponse()


    @Response(HttpStatusCode.NOT_FOUND, "User not found")
    class UserNotFound(
        @Body val body: HttpErrorResponse = HttpErrorResponse(
            status = HttpStatusCode.NOT_FOUND,
            errorCode = "USER_NOT_FOUND",
            title = "User not found",
            detail = "User could not be found.",
        )
    ) : UserLoginResponse()


    @Response(HttpStatusCode.CONFLICT, "User not confirmed")
    class UserNotConfirmed(
        @Body val body: HttpErrorResponse = HttpErrorResponse(
            status = HttpStatusCode.CONFLICT,
            errorCode = "USER_NOT_CONFIRMED",
            title = "User not confirmed",
            detail = "User has not confirmed their account.",
        )
    ) : UserLoginResponse()


    @Response(HttpStatusCode.INTERNAL_SERVER_ERROR, "An internal error occurred.")
    class InternalError(
        @Body val body: HttpErrorResponse = HttpErrorResponse.internalError()
    ) : UserLoginResponse()


    @Response(HttpStatusCode.UNAUTHORIZED, "Unauthorized.")
    class Unauthorized(
        @Body val body: HttpErrorResponse = HttpErrorResponse.unauthorized()
    ) : UserLoginResponse()

}


@Serializable
private data class LoginData(
    val email: String,
    val password: String,
)


@Serializable
private data class AuthData(
    val idToken: String,
    val refreshToken: String?,
)
