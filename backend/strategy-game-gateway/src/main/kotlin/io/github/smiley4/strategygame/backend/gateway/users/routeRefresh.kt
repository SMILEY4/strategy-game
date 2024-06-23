package io.github.smiley4.strategygame.backend.gateway.users

import io.github.smiley4.ktorswaggerui.dsl.post
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.gateway.ErrorResponse
import io.github.smiley4.strategygame.backend.gateway.bodyErrorResponse
import io.github.smiley4.strategygame.backend.users.edge.RefreshUserToken
import io.github.smiley4.strategygame.backend.users.edge.models.AuthData
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route

internal object RouteRefresh {

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

    fun Route.routeRefresh(userRefresh: RefreshUserToken) = post("refresh", {
        description = "Get a new token without sending the users credentials again"
        request {
            body<String>()
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
            call.receive<String>().let { requestData ->
                try {
                    val auth = userRefresh.perform(requestData)
                    call.respond(HttpStatusCode.OK, auth)
                } catch (e: RefreshUserToken.RefreshTokenError) {
                    when(e) {
                        is RefreshUserToken.NotAuthorizedError -> call.respond(UnauthorizedResponse)
                        is RefreshUserToken.UserNotConfirmedError -> call.respond(UserNotConfirmedResponse)
                        is RefreshUserToken.UserNotFoundError -> call.respond(UserNotFoundResponse)
                    }
                }
            }
        }
    }

}