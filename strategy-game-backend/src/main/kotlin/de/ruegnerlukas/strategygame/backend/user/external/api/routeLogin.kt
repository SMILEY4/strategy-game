package de.ruegnerlukas.strategygame.backend.user.external.api

import de.ruegnerlukas.strategygame.backend.common.api.ApiResponse
import de.ruegnerlukas.strategygame.backend.common.Err
import de.ruegnerlukas.strategygame.backend.common.Ok
import de.ruegnerlukas.strategygame.backend.common.mdcTraceId
import de.ruegnerlukas.strategygame.backend.common.withLoggingContextAsync
import de.ruegnerlukas.strategygame.backend.user.ports.models.AuthData
import de.ruegnerlukas.strategygame.backend.user.ports.provided.LoginUser
import de.ruegnerlukas.strategygame.backend.user.ports.required.UserIdentityService
import io.github.smiley4.ktorswaggerui.dsl.post
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.request.receive
import io.ktor.server.routing.Route

fun Route.routeLogin(userLogin: LoginUser) = post("login", {
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
                    description = "The user has not confirmed the code."
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
                is Ok -> ApiResponse.respondSuccess(call, AuthData(result.value))
                is Err -> when (result.value) {
                    LoginUser.NotAuthorizedError -> ApiResponse.respondAuthFailed(call)
                    LoginUser.UserNotConfirmedError -> ApiResponse.respondFailure(call, result.value)
                    LoginUser.UserNotFoundError -> ApiResponse.respondFailure(call, result.value)
                }
            }
        }
    }
}