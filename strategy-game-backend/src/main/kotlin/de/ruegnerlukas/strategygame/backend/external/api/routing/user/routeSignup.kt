package de.ruegnerlukas.strategygame.backend.external.api.routing.user

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.external.api.routing.ApiResponse
import de.ruegnerlukas.strategygame.backend.ports.models.CreateUserData
import de.ruegnerlukas.strategygame.backend.ports.provided.user.UserCreateAction
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService
import de.ruegnerlukas.strategygame.backend.shared.mdcTraceId
import de.ruegnerlukas.strategygame.backend.shared.withLoggingContextAsync
import io.github.smiley4.ktorswaggerui.dsl.post
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.request.receive
import io.ktor.server.routing.Route

fun Route.routeSignup(userCreate: UserCreateAction) = post("signup", {
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
                is Either.Right -> ApiResponse.respondSuccess(call)
                is Either.Left -> ApiResponse.respondFailure(call, result.value)
            }
        }
    }
}