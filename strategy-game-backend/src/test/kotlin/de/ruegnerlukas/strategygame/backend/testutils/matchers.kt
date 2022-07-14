package de.ruegnerlukas.strategygame.backend.testutils

import arrow.core.Either
import io.kotest.matchers.shouldBe


infix fun <L, R> Either<L, R>.shouldBeOk(success: Boolean) {
	isRight() shouldBe success
}

infix fun <L, R> Either<L, R>.shouldBeError(error: Boolean) {
	isLeft() shouldBe error
}

infix fun <L, R> Either<L, R>.shouldBeError(error: L) {
	isLeft() shouldBe true
	(this as Either.Left<L>).value shouldBe error
}