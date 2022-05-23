package de.ruegnerlukas.strategygame.backend.testutils

import de.ruegnerlukas.strategygame.backend.shared.Rail
import io.kotest.matchers.shouldBe

infix fun <T> Rail<T>.shouldBeSuccess(success: Boolean) {
	isSuccess() shouldBe success
}

infix fun <T> Rail<T>.shouldBeError(error: Boolean) {
	isError() shouldBe error
}

infix fun <T> Rail<T>.shouldBeError(error: String) {
	isError() shouldBe true
	getError().message shouldBe error
}