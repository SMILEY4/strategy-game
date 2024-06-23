package io.github.smiley4.strategygame.backend.gateway.users

import io.github.smiley4.ktorswaggerui.dsl.post
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.gateway.ErrorResponse
import io.github.smiley4.strategygame.backend.gateway.bodyErrorResponse
import io.github.smiley4.strategygame.backend.users.edge.CreateUser
import io.github.smiley4.strategygame.backend.users.edge.models.CreateUserData
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route

internal object RouteSignup {

    private object CodeDeliveryFailedResponse : ErrorResponse(
        status = 409,
        title = "Code delivery failed",
        errorCode = "CODE_DELIVERY_FAILED",
        detail = "Verification code could not be delivered to provided email.",
    )

    private object InvalidEmailOrPasswordResponse : ErrorResponse(
        status = 409,
        title = "Invalid email or password",
        errorCode = "INVALID_EMAIL_OR_PASSWORD",
        detail = "Provided email or password is invalid.",
    )

    private object UserAlreadyExistsResponse : ErrorResponse(
        status = 409,
        title = "User already exists",
        errorCode = "USER_ALREADY_EXISTS",
        detail = "User with the given email already exists.",
    )

    fun Route.routeSignup(userCreate: CreateUser) = post("signup", {
        description = "Create a new user"
        request {
            body<CreateUserData>()
        }
        response {
            HttpStatusCode.OK to {}
            HttpStatusCode.Conflict to {
                bodyErrorResponse(CodeDeliveryFailedResponse, InvalidEmailOrPasswordResponse, UserAlreadyExistsResponse)
            }
        }
    }) {
        withLoggingContextAsync(mdcTraceId()) {
            call.receive<CreateUserData>().let { requestData ->
                try {
                    userCreate.perform(requestData.email, requestData.password, requestData.username)
                    call.respond(HttpStatusCode.OK, Unit)
                } catch (e: CreateUser.CreateUserError) {
                    when(e) {
                        is CreateUser.CodeDeliveryError -> call.respond(CodeDeliveryFailedResponse)
                        is CreateUser.InvalidEmailOrPasswordError -> call.respond(InvalidEmailOrPasswordResponse)
                        is CreateUser.UserAlreadyExistsError -> call.respond(UserAlreadyExistsResponse)
                    }
                }
            }
        }
    }

}

