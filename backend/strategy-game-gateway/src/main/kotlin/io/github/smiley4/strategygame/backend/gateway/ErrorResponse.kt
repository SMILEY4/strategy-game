package io.github.smiley4.strategygame.backend.gateway

import io.github.smiley4.ktorswaggerui.dsl.OpenApiResponse
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.respond

internal open class ErrorResponse(
    /**
     * an url to a document describing the error
     */
    val type: String = "about:blank",
    /**
     * the http status code
     */
    val status: Int,
    /**
     * A short, human-readable title for the general error type
     */
    val title: String,
    /**
     * a machine-readable (enum-like) code for the general error type
     */
    val errorCode: String,
    /**
     * a human-readable description of the specific error
     */
    val detail: String,
    /**
     * additional machine-readable key-value pairs relevant for the specific error
     */
    val context: Map<String, Any?>? = null
) {

    companion object {

        fun from(exception: Throwable) = ErrorResponse(
            status = 500,
            title = exception::class.simpleName ?: "Error",
            errorCode = exception::class.qualifiedName ?: "ERROR",
            detail = exception.message ?: "",
        )

        fun unauthorized() = ErrorResponse(
            status = 401,
            title = "Unauthorized",
            errorCode = "UNAUTHORIZED",
            detail = "THe provided credentials are not valid.",
        )


    }

}

internal fun OpenApiResponse.bodyErrorResponse() {
    this.body<ErrorResponse>()
}

internal fun <T : ErrorResponse> OpenApiResponse.bodyErrorResponse(response: T) {
    this.body(response::class) {
        example(response.title, response) {
            description = response.detail
        }
    }
}

internal fun OpenApiResponse.bodyErrorResponse(vararg responses: ErrorResponse) {
    this.body<ErrorResponse> {
        responses.forEach { response ->
            example(response.title, response) {
                description = response.detail
            }
        }
    }
}

internal suspend inline fun <reified T : ErrorResponse> ApplicationCall.respond(response: T) {
    this.respond(HttpStatusCode.fromValue(response.status), response)
}