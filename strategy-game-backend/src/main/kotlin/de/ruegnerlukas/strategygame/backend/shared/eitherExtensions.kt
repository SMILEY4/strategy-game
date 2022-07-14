package de.ruegnerlukas.strategygame.backend.shared

import arrow.core.Either
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.respond

class EitherToResponseMapping<L, R> {

	companion object {

		data class RightMapping<R>(
			val status: HttpStatusCode,
			val body: Any?
		)

		data class LeftMapping<L>(
			val left: L?,
			val status: HttpStatusCode,
			val body: Any?
		)

	}

	internal val rightMappings = mutableListOf<RightMapping<R>>()
	internal val leftMappings = mutableListOf<LeftMapping<L>>()

	fun anyRight(status: HttpStatusCode, body: Any) {
		rightMappings.add(RightMapping(status, body))
	}

	fun anyLeft(status: HttpStatusCode) {
		leftMappings.add(LeftMapping(null, status, null))
	}

	fun anyLeft(status: HttpStatusCode, body: Any) {
		leftMappings.add(LeftMapping(null, status, body))
	}

	fun left(left: L, status: HttpStatusCode) {
		leftMappings.add(LeftMapping(left, status, null))
	}

	fun left(left: L, status: HttpStatusCode, body: Any) {
		leftMappings.add(LeftMapping(left, status, body))
	}


}

suspend fun <L, R> Either<L, R>.respondHttp(call: ApplicationCall, mapping: EitherToResponseMapping<L, R>.() -> Unit) {
	val responseMapping = EitherToResponseMapping<L, R>().apply(mapping)
	when (this) {
		is Either.Right<R> -> {
			responseMapping.rightMappings
				.firstOrNull()
				?.let {
					if (it.body == null) {
						call.respond(it.status)
					} else {
						call.respond(it.status, it.body)
					}
				}
		}
		is Either.Left<L> -> {
			responseMapping.leftMappings
				.filter { it.left == null || it.left == this.value }
				.firstOrNull()
				?.let {
					if (it.body == null) {
						call.respond(it.status, it.toString())
					} else {
						call.respond(it.status, it.body)
					}
				}
		}
	}
}