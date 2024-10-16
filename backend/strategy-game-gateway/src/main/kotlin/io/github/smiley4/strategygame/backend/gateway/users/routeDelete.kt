package io.github.smiley4.strategygame.backend.gateway.users

import io.github.smiley4.ktorswaggerui.dsl.delete
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.gateway.ErrorResponse
import io.github.smiley4.strategygame.backend.gateway.bodyErrorResponse
import io.github.smiley4.strategygame.backend.users.edge.DeleteUser
import io.github.smiley4.strategygame.backend.users.edge.models.LoginData
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route

internal object RouteDelete {

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

    fun Route.routeDelete(userDelete: DeleteUser) = delete("delete", {
        description = "Delete the given user. Email and password must be send again, even though the user is already logged-in"
        request {
            body<LoginData>()
        }
        response {
            HttpStatusCode.OK to {
                description = "User was successfully deleted"
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
                    userDelete.perform(requestData.email, requestData.password)
                    call.respond(HttpStatusCode.OK, Unit)
                } catch (e: DeleteUser.DeleteUserError) {
                    when(e) {
                        is DeleteUser.NotAuthorizedError -> call.respond(UnauthorizedResponse)
                        is DeleteUser.UserNotConfirmedError -> call.respond(UserNotConfirmedResponse)
                        is DeleteUser.UserNotFoundError -> call.respond(UserNotFoundResponse)
                    }
                }
            }
        }
    }

}
