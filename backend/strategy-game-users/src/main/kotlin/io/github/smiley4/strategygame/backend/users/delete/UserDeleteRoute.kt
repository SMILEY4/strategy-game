package io.github.smiley4.strategygame.backend.users.delete

import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.users.ErrorResponse
import io.github.smiley4.strategygame.backend.users.LoginData
import io.ktor.http.HttpStatusCode
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.delete
import org.koin.ktor.ext.inject


private object UnauthorizedResponse : ErrorResponse(
    status = 401,
    title = "Unauthorized",
    errorCode = "UNAUTHORIZED",
    detail = "The provided email or password is invalid.",
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

fun Route.routeUserDelete(): Route {
    val userDelete by inject<UserDelete>()
    return delete("delete") {
        withLoggingContextAsync(mdcTraceId()) {
            call.receive<LoginData>().let { requestData ->
                try {
                    userDelete.delete(requestData.email, requestData.password)
                    call.respond(HttpStatusCode.OK, Unit)
                } catch (e: UserDeleteError) {
                    when (e) {
                        is UserDeleteError.NotAuthorizedError -> call.respond(UnauthorizedResponse)
                        is UserDeleteError.UserNotConfirmedError -> call.respond(UserNotConfirmedResponse)
                        is UserDeleteError.UserNotFoundError -> call.respond(UserNotFoundResponse)
                    }
                }
            }
        }
    }
}