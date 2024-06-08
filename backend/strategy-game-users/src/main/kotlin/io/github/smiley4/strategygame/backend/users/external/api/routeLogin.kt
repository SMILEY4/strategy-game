package io.github.smiley4.strategygame.backend.users.external.api

import io.github.smiley4.strategygame.backend.users.ports.models.AuthData
import io.github.smiley4.strategygame.backend.users.ports.provided.LoginUser
import io.github.smiley4.ktorswaggerui.dsl.post
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.users.ErrorResponse
import io.github.smiley4.strategygame.backend.users.bodyErrorResponse
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route

object RouteLogin {

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

    fun Route.routeLogin(userLogin: LoginUser) = post("login", {
        description = "Log-in as an existing user, i.e. request a new authentication token."
        request {
            body<LoginData> {
                example("LoginData", LoginData("email@example.com", "password123"))
            }
        }
        response {
            HttpStatusCode.OK to {
                body<AuthData>()
            }
            HttpStatusCode.Unauthorized to {
                bodyErrorResponse(UnauthorizedResponse)
            }
            HttpStatusCode.Conflict to {
                bodyErrorResponse(UserNotConfirmedResponse)
            }
            HttpStatusCode.NotFound to {
                bodyErrorResponse(UserNotFoundResponse)
            }
        }
    }) {
        withLoggingContextAsync(mdcTraceId()) {
            call.receive<LoginData>().let { requestData ->
                try {
                    val auth = userLogin.perform(requestData.email, requestData.password)
                    call.respond(HttpStatusCode.OK, AuthData(auth))
                } catch (e: LoginUser.LoginUserError) {
                    when(e) {
                        is LoginUser.NotAuthorizedError -> call.respond(UnauthorizedResponse)
                        is LoginUser.UserNotConfirmedError -> call.respond(UserNotConfirmedResponse)
                        is LoginUser.UserNotFoundError -> call.respond(UserNotFoundResponse)
                    }
                }
            }
        }
    }

}
