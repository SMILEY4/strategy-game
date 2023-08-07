package de.ruegnerlukas.strategygame.backend.user.external.api

import de.ruegnerlukas.strategygame.backend.common.logging.mdcTraceId
import de.ruegnerlukas.strategygame.backend.common.logging.withLoggingContextAsync
import de.ruegnerlukas.strategygame.backend.common.models.ErrorResponse
import de.ruegnerlukas.strategygame.backend.common.models.bodyErrorResponse
import de.ruegnerlukas.strategygame.backend.common.models.respond
import de.ruegnerlukas.strategygame.backend.common.utils.Err
import de.ruegnerlukas.strategygame.backend.common.utils.Ok
import de.ruegnerlukas.strategygame.backend.user.ports.models.AuthData
import de.ruegnerlukas.strategygame.backend.user.ports.provided.LoginUser
import io.github.smiley4.ktorswaggerui.dsl.post
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
                when (val result = userLogin.perform(requestData.email, requestData.password)) {
                    is Ok -> call.respond(HttpStatusCode.OK, AuthData(result.value))
                    is Err -> when (result.value) {
                        LoginUser.NotAuthorizedError -> call.respond(UnauthorizedResponse)
                        LoginUser.UserNotConfirmedError -> call.respond(UserNotConfirmedResponse)
                        LoginUser.UserNotFoundError -> call.respond(UserNotFoundResponse)
                    }
                }
            }
        }
    }

}
