package de.ruegnerlukas.strategygame.backend.testutils

import arrow.core.Either
import io.kotest.assertions.withClue
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe


infix fun <L, R> Either<L, R>.shouldBeOk(success: Boolean) {
	withClue(this) {
		isRight() shouldBe success
	}
}

infix fun <L, R> Either<L, R>.shouldBeError(error: Boolean) {
	withClue(this) {
		isLeft() shouldBe error
	}
}

infix fun <L, R> Either<L, R>.shouldBeError(error: L) {
	withClue(this) {
		isLeft() shouldBe true
		(this as Either.Left<L>).value shouldBe error
	}
}

infix fun <T: Exception> T?.shouldMatchError(error: T?) {
	if(error == null) {
		this shouldBe null
	} else {
		this shouldNotBe null
		this!!::class shouldBe error::class
	}
}