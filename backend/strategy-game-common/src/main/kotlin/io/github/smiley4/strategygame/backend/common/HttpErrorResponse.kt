package io.github.smiley4.strategygame.backend.common

import io.ktor.http.HttpStatusCode
import kotlinx.serialization.Serializable

/**
 * A standardized, detailed http error response.
 * Roughly based on https://www.rfc-editor.org/rfc/rfc7807.
 */
@Serializable
data class HttpErrorResponse(
    /**
     * The associated http status code.
     */
    val status: Int,
    /**
     * A machine-readable (enum-like) code for the general error type.
     */
    val errorCode: String,
    /**
     * A short, human-readable title for the general error type.
     */
    val title: String,
    /**
     * A human-readable description of the specific error.
     */
    val detail: String,
    /**
     * Additional machine-readable key-value pairs relevant for the specific error.
     */
    val context: Map<String, String>? = null
) {
    companion object
}

fun HttpErrorResponse.Companion.unauthorized() = HttpErrorResponse(
    status = HttpStatusCode.Unauthorized.value,
    errorCode = "UNAUTHORIZED",
    title = "Unauthorized",
    detail = "Invalid credentials.",
)

fun HttpErrorResponse.Companion.internalError() = HttpErrorResponse(
    status = HttpStatusCode.InternalServerError.value,
    errorCode = "INTERNAL_ERROR",
    title = "Internal error",
    detail = "An internal error occurred.",
)

fun HttpErrorResponse.Companion.from(exception: Throwable) = HttpErrorResponse(
    status = 500,
    title = exception::class.simpleName ?: "Error",
    errorCode = exception::class.qualifiedName ?: "ERROR",
    detail = exception.message ?: "",
)