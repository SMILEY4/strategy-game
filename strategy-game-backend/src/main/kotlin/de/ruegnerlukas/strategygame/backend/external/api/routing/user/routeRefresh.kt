package de.ruegnerlukas.strategygame.backend.external.api.routing.user

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.external.api.routing.ApiResponse
import de.ruegnerlukas.strategygame.backend.ports.models.AuthData
import de.ruegnerlukas.strategygame.backend.ports.provided.user.UserRefreshTokenAction
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService
import de.ruegnerlukas.strategygame.backend.shared.mdcTraceId
import de.ruegnerlukas.strategygame.backend.shared.withLoggingContextAsync
import io.github.smiley4.ktorswaggerui.dsl.post
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.request.receive
import io.ktor.server.routing.Route

fun Route.routeRefresh(userRefresh: UserRefreshTokenAction) = post("refresh", {
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
                is Either.Right -> ApiResponse.respondSuccess(call, result.value)
                is Either.Left -> when (result.value) {
                    UserRefreshTokenAction.NotAuthorizedError -> ApiResponse.respondAuthFailed(call)
                    UserRefreshTokenAction.UserNotConfirmedError -> ApiResponse.respondFailure(call, result.value)
                    UserRefreshTokenAction.UserNotFoundError -> ApiResponse.respondFailure(call, result.value)
                }
            }
        }
    }
}