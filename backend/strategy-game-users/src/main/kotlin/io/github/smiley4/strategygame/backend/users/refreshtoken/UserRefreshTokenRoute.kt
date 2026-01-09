package io.github.smiley4.strategygame.backend.users.refreshtoken

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

private val logger = KotlinLogging.logger("route.user-refresh-token")


internal fun Route.routeUserRefreshToken() {
    val userRefreshToken by inject<UserRefreshToken>()
    post<UserRefreshTokenRequest, UserRefreshTokenResponse>("refresh") { request ->
        withLoggingContextAsync(mdcTraceId()) {
            try {
                val auth = userRefreshToken.refreshToken(request.body.refreshToken)
                UserRefreshTokenResponse.Success(AuthData(auth.idToken, auth.refreshToken))
            } catch (e: UserRefreshTokenError) {
                logger.warn(e) { "Failed to refresh user token." }
                when (e) {
                    is UserRefreshTokenError.NotAuthorizedError -> UserRefreshTokenResponse.Unauthorized()
                    is UserRefreshTokenError.UserNotConfirmedError -> UserRefreshTokenResponse.UserNotConfirmed()
                    is UserRefreshTokenError.UserNotFoundError -> UserRefreshTokenResponse.UserNotFound()
                }
            } catch (e: Exception) {
                logger.warn(e) { "Failed to refresh user token." }
                UserRefreshTokenResponse.InternalError()
            }
        }
    }
}

@Request
private class UserRefreshTokenRequest(
    @Body val body: RefreshData
)

private sealed class UserRefreshTokenResponse {

    @Response(HttpStatusCode.OK, "Token successfully refreshed.")
    class Success(
        @Body val body: AuthData
    ) : UserRefreshTokenResponse()


    @Response(HttpStatusCode.NOT_FOUND, "User not found")
    class UserNotFound(
        @Body val body: HttpErrorResponse = HttpErrorResponse(
            status = HttpStatusCode.NOT_FOUND,
            errorCode = "USER_NOT_FOUND",
            title = "User not found",
            detail = "User could not be found.",
        )
    ) : UserRefreshTokenResponse()


    @Response(HttpStatusCode.CONFLICT, "User not confirmed")
    class UserNotConfirmed(
        @Body val body: HttpErrorResponse = HttpErrorResponse(
            status = HttpStatusCode.CONFLICT,
            errorCode = "USER_NOT_CONFIRMED",
            title = "User not confirmed",
            detail = "User has not confirmed their account.",
        )
    ) : UserRefreshTokenResponse()


    @Response(HttpStatusCode.INTERNAL_SERVER_ERROR, "An internal error occurred.")
    class InternalError(
        @Body val body: HttpErrorResponse = HttpErrorResponse.internalError()
    ) : UserRefreshTokenResponse()


    @Response(HttpStatusCode.UNAUTHORIZED, "Unauthorized.")
    class Unauthorized(
        @Body val body: HttpErrorResponse = HttpErrorResponse.unauthorized()
    ) : UserRefreshTokenResponse()

}


@Serializable
private data class RefreshData(
    val refreshToken: String
)


@Serializable
private data class AuthData(
    val idToken: String,
    val refreshToken: String?,
)
