package de.ruegnerlukas.strategygame.backend.user.external.api

import de.ruegnerlukas.strategygame.backend.common.logging.mdcTraceId
import de.ruegnerlukas.strategygame.backend.common.logging.withLoggingContextAsync
import de.ruegnerlukas.strategygame.backend.common.models.ErrorResponse
import de.ruegnerlukas.strategygame.backend.common.models.bodyErrorResponse
import de.ruegnerlukas.strategygame.backend.common.models.respond
import de.ruegnerlukas.strategygame.backend.common.utils.Err
import de.ruegnerlukas.strategygame.backend.common.utils.Ok
import de.ruegnerlukas.strategygame.backend.user.ports.provided.CreateUser
import io.github.smiley4.ktorswaggerui.dsl.post
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route

object RouteSignup {

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
                when (val result = userCreate.perform(requestData.email, requestData.password, requestData.username)) {
                    is Ok -> call.respond(HttpStatusCode.OK, Unit)
                    is Err -> when (result.value) {
                        CreateUser.CodeDeliveryError -> call.respond(CodeDeliveryFailedResponse)
                        CreateUser.InvalidEmailOrPasswordError -> call.respond(InvalidEmailOrPasswordResponse)
                        CreateUser.UserAlreadyExistsError -> call.respond(UserAlreadyExistsResponse)
                    }
                }
            }
        }
    }

}

