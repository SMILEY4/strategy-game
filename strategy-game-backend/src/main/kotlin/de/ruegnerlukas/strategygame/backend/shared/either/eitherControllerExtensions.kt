package de.ruegnerlukas.strategygame.backend.shared.either

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.respond

/**
 * If this [Either] is an [Ok], respond to the given call with the given http-status code and the current value as the body
 */
suspend inline fun <reified V : Any, E> Either<V, E>.respondCallOk(call: ApplicationCall, httpCode: HttpStatusCode): Either<V, E> {
	return onSuccess { call.respond(httpCode, it) }
}


/**
 * If this [Either] is an [Err] with the error equal to the given one, respond to the given call with the given http-status code and error as the body. Recovers from the given error.
 */
suspend inline fun <reified E> Either<Any, E>.respondCallErr(
	call: ApplicationCall,
	expectedError: E,
	httpCode: HttpStatusCode
): Either<Any, E> {
	return recover(expectedError) { call.respond(httpCode, it.toString()) }
}


/**
 * If this [Either] is an [Err], respond to the given call with the given http-status code and error as the body. Recovers from the error.
 */
suspend inline fun <reified E> Either<Any, E>.respondCallErr(call: ApplicationCall, httpCode: HttpStatusCode): Either<Any, E> {
	return recover { call.respond(httpCode, it.toString()) }
}