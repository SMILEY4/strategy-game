package de.ruegnerlukas.strategygame.backend.external.api.routing.user

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.external.api.routing.ApiResponse
import de.ruegnerlukas.strategygame.backend.ports.models.LoginData
import de.ruegnerlukas.strategygame.backend.ports.provided.user.UserDeleteAction
import de.ruegnerlukas.strategygame.backend.shared.mdcTraceId
import de.ruegnerlukas.strategygame.backend.shared.withLoggingContextAsync
import io.github.smiley4.ktorswaggerui.dsl.delete
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.request.receive
import io.ktor.server.routing.Route

fun Route.routeDelete(userDelete: UserDeleteAction) = delete("delete", {
    description = "Delete the given user. Email and password must be send again, even though the user is already \"logged in\""
    request {
        body(LoginData::class)
    }
    response {
        HttpStatusCode.OK to {
            description = "User was successfully deleted"
        }
        HttpStatusCode.Unauthorized to {
            description = "Authentication failed"
            body(ApiResponse::class) {
                example("Unauthorized", ApiResponse.authenticationFailed()) {
                    description = "The provided email and password is invalid."
                }
            }
        }
    }
}) {
    withLoggingContextAsync(mdcTraceId()) {
        call.receive<LoginData>().let { requestData ->
            when (val result = userDelete.perform(requestData.email, requestData.password)) {
                is Either.Right -> ApiResponse.respondSuccess(call)
                is Either.Left -> when (result.value) {
                    UserDeleteAction.NotAuthorizedError -> ApiResponse.respondAuthFailed(call)
                    UserDeleteAction.UserNotConfirmedError -> ApiResponse.respondFailure(call, result.value)
                    UserDeleteAction.UserNotFoundError -> ApiResponse.respondFailure(call, result.value)
                }
            }
        }
    }
}