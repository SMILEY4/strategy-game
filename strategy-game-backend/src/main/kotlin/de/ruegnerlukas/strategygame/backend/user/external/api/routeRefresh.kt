package de.ruegnerlukas.strategygame.backend.user.external.api

import de.ruegnerlukas.strategygame.backend.external.api.routing.ApiResponse
import de.ruegnerlukas.strategygame.backend.shared.Err
import de.ruegnerlukas.strategygame.backend.shared.Ok
import de.ruegnerlukas.strategygame.backend.shared.mdcTraceId
import de.ruegnerlukas.strategygame.backend.shared.withLoggingContextAsync
import de.ruegnerlukas.strategygame.backend.user.ports.models.AuthData
import de.ruegnerlukas.strategygame.backend.user.ports.provided.RefreshUserToken
import de.ruegnerlukas.strategygame.backend.user.ports.required.UserIdentityService
import io.github.smiley4.ktorswaggerui.dsl.post
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.request.receive
import io.ktor.server.routing.Route

fun Route.routeRefresh(userRefresh: RefreshUserToken) = post("refresh", {
    description = "Get a new token without sending the users credentials again"
    request {
        body(String::class)
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
                    description = "The provided refresh token is invalid."
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
        call.receive<String>().let { requestData ->
            when (val result = userRefresh.perform(requestData)) {
                is Ok -> ApiResponse.respondSuccess(call, result.value)
                is Err -> when (result.value) {
                    RefreshUserToken.NotAuthorizedError -> ApiResponse.respondAuthFailed(call)
                    RefreshUserToken.UserNotConfirmedError -> ApiResponse.respondFailure(call, result.value)
                    RefreshUserToken.UserNotFoundError -> ApiResponse.respondFailure(call, result.value)
                }
            }
        }
    }
}