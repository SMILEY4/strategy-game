package de.ruegnerlukas.strategygame.backend.external.api.routing

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.respond

data class ApiResponse<T>(
    val successful: Boolean,
    val status: String,
    val content: T?
) {

    companion object {

        fun failure(): ApiResponse<Unit> = ApiResponse(
            successful = false,
            status = "failure",
            content = null
        )

        fun <E> failure(error: E) = ApiResponse<Unit>(
            successful = false,
            status = error.toString(),
            content = null
        )

        fun <E, T> failure(error: E, content: T? = null) = ApiResponse(
            successful = false,
            status = error.toString(),
            content = content
        )

        fun authenticationFailed(): ApiResponse<Unit> = ApiResponse(
            successful = false,
            status = "AuthenticationFailed",
            content = null
        )

        suspend inline fun respondSuccess(call: ApplicationCall) {
            call.respond(HttpStatusCode.OK, Unit)
        }

        suspend inline fun <reified T : Any> respondSuccess(call: ApplicationCall, content: T) {
            call.respond(HttpStatusCode.OK, content)
        }

        suspend inline fun <reified E> respondFailure(call: ApplicationCall, error: E) {
            call.respond(HttpStatusCode.Conflict, failure<E, Unit>(error))
        }

        suspend inline fun respondAuthFailed(call: ApplicationCall) {
            call.respond(HttpStatusCode.Unauthorized, authenticationFailed())
        }

    }

}