package io.github.smiley4.strategygame.backend.common

/**
 * Exception converted into the proper given error response.
 * Use when normal "call.respond" is not possible, e.g. before proper websocket connection (would cause infinite loop).
 */
class ErrorResponseException(val response: ErrorResponse) : Exception(response.detail)