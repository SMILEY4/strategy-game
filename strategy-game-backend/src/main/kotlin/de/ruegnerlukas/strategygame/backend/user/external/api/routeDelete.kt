package de.ruegnerlukas.strategygame.backend.user.external.api

import de.ruegnerlukas.strategygame.backend.external.api.routing.ApiResponse
import de.ruegnerlukas.strategygame.backend.shared.Err
import de.ruegnerlukas.strategygame.backend.shared.Ok
import de.ruegnerlukas.strategygame.backend.shared.mdcTraceId
import de.ruegnerlukas.strategygame.backend.shared.withLoggingContextAsync
import de.ruegnerlukas.strategygame.backend.user.ports.provided.DeleteUser
import io.github.smiley4.ktorswaggerui.dsl.delete
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.request.receive
import io.ktor.server.routing.Route

fun Route.routeDelete(userDelete: DeleteUser) = delete("delete", {
    description = "Delete the given user. Email and password must be send again, even though the user is already logged-in"
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
                is Ok -> ApiResponse.respondSuccess(call)
                is Err -> when (result.value) {
                    DeleteUser.NotAuthorizedError -> ApiResponse.respondAuthFailed(call)
                    DeleteUser.UserNotConfirmedError -> ApiResponse.respondFailure(call, result.value)
                    DeleteUser.UserNotFoundError -> ApiResponse.respondFailure(call, result.value)
                }
            }
        }
    }
}