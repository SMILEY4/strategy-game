package io.github.smiley4.strategygame.backend.users.refreshtoken

import io.github.smiley4.ktorswaggerui.dsl.routing.post
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.users.ErrorResponse
import io.ktor.http.HttpStatusCode
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import org.koin.ktor.ext.inject

private object UnauthorizedResponse : ErrorResponse(
    status = 401,
    title = "Unauthorized",
    errorCode = "UNAUTHORIZED",
    detail = "The provided refresh token is invalid.",
)

private object UserNotConfirmedResponse : ErrorResponse(
    status = 409,
    title = "User not confirmed",
    errorCode = "USER_NOT_CONFIRMED",
    detail = "The user has not confirmed the confirmation code."
)

private object UserNotFoundResponse : ErrorResponse(
    status = 404,
    title = "User not found",
    errorCode = "USER_NOT_FOUND",
    detail = "The user does not exist."
)

fun Route.routeUserRefreshToken(): Route {
    val userRefreshToken by inject<UserRefreshToken>()
    return post("refresh") {
        withLoggingContextAsync(mdcTraceId()) {
            call.receive<String>().let { requestData ->
                try {
                    val auth = userRefreshToken.refreshToken(requestData)
                    call.respond(HttpStatusCode.OK, auth)
                } catch (e: UserRefreshTokenError) {
                    when (e) {
                        is UserRefreshTokenError.NotAuthorizedError -> call.respond(UnauthorizedResponse)
                        is UserRefreshTokenError.UserNotConfirmedError -> call.respond(UserNotConfirmedResponse)
                        is UserRefreshTokenError.UserNotFoundError -> call.respond(UserNotFoundResponse)
                    }
                }
            }
        }
    }
}