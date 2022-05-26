package de.ruegnerlukas.strategygame.backend.testutils

import de.ruegnerlukas.strategygame.backend.shared.either.Either
import io.kotest.matchers.shouldBe


infix fun <V, E> Either<V, E>.shouldBeOk(success: Boolean) {
	isOk() shouldBe success
}

infix fun <V, E> Either<V, E>.shouldBeError(error: Boolean) {
	isError() shouldBe error
}

infix fun <V, E> Either<V, E>.shouldBeError(error: E) {
	isError() shouldBe true
	error shouldBe error
}