package de.ruegnerlukas.strategygame.backend.external.api.routing.user

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.external.api.routing.ApiResponse
import de.ruegnerlukas.strategygame.backend.ports.models.AuthData
import de.ruegnerlukas.strategygame.backend.ports.models.LoginData
import de.ruegnerlukas.strategygame.backend.ports.provided.user.UserLoginAction
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService
import de.ruegnerlukas.strategygame.backend.shared.mdcTraceId
import de.ruegnerlukas.strategygame.backend.shared.withLoggingContextAsync
import io.github.smiley4.ktorswaggerui.dsl.post
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.request.receive
import io.ktor.server.routing.Route

fun Route.routeLogin(userLogin: UserLoginAction) = post("login", {
    description = "Log-in as an existing user, i.e. request a new authentication token."
    request {
        body(LoginData::class)
    }
    response {
        HttpStatusCode.OK to {
            description = "Authentication successful"
            body(AuthData::class)
        }
        HttpStatusCode.Unauthorized to {
            description = "Authentication failed"
            body(ApiResponse::class) {
                example("Unauthorized", ApiResponse.authenticationFailed()) {
                    description = "The provided email or password is invalid."
                }
            }
        }
        HttpStatusCode.Conflict to {
            description = "Error during authentication."
            body(ApiResponse::class) {
                example("UserNotConfirmedError", ApiResponse.failure(UserIdentityService.UserNotConfirmedError)) {
                    description = " The user has not confirmed the code"
                }
                example("UserNotFoundError", ApiResponse.failure(UserIdentityService.UserNotFoundError)) {
                    description = "The user does not exist."
                }
            }
        }
    }
}) {
    withLoggingContextAsync(mdcTraceId()) {
        call.receive<LoginData>().let { requestData ->
            when (val result = userLogin.perform(requestData.email, requestData.password)) {
                is Either.Right -> ApiResponse.respondSuccess(call, AuthData(result.value))
                is Either.Left -> when (result.value) {
                    UserLoginAction.NotAuthorizedError -> ApiResponse.respondAuthFailed(call)
                    UserLoginAction.UserNotConfirmedError -> ApiResponse.respondFailure(call, result.value)
                    UserLoginAction.UserNotFoundError -> ApiResponse.respondFailure(call, result.value)
                }
            }
        }
    }
}