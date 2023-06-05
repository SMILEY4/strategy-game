package de.ruegnerlukas.strategygame.backend.user.external.api

import de.ruegnerlukas.strategygame.backend.common.api.ApiResponse
import de.ruegnerlukas.strategygame.backend.ports.models.CreateUserData
import de.ruegnerlukas.strategygame.backend.common.Err
import de.ruegnerlukas.strategygame.backend.common.Ok
import de.ruegnerlukas.strategygame.backend.common.mdcTraceId
import de.ruegnerlukas.strategygame.backend.common.withLoggingContextAsync
import de.ruegnerlukas.strategygame.backend.user.ports.provided.CreateUser
import de.ruegnerlukas.strategygame.backend.user.ports.required.UserIdentityService
import io.github.smiley4.ktorswaggerui.dsl.post
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.request.receive
import io.ktor.server.routing.Route

fun Route.routeSignup(userCreate: CreateUser) = post("signup", {
    description = "Create a new user"
    request {
        body(CreateUserData::class)
    }
    response {
        HttpStatusCode.OK to {
            description = "Successfully accepted the signup-request."
        }
        HttpStatusCode.Conflict to {
            description = "Error during signup."
            body(ApiResponse::class) {
                example("CodeDeliveryError", ApiResponse.failure(UserIdentityService.CodeDeliveryError)) {
                    description = "Verification code could not be delivered to provided email."
                }
                example("InvalidEmailOrPasswordError", ApiResponse.failure(UserIdentityService.InvalidEmailOrPasswordError)) {
                    description = "Provided email or password is invalid."
                }
                example("UserAlreadyExistsError", ApiResponse.failure(UserIdentityService.UserAlreadyExistsError)) {
                    description = "User with the given email already exists."
                }
            }
        }
    }
}) {
    withLoggingContextAsync(mdcTraceId()) {
        call.receive<CreateUserData>().let { requestData ->
            when (val result = userCreate.perform(requestData.email, requestData.password, requestData.username)) {
                is Ok -> ApiResponse.respondSuccess(call)
                is Err -> ApiResponse.respondFailure(call, result.value)
            }
        }
    }
}