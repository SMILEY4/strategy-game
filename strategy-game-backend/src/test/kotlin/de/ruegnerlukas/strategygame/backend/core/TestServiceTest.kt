package de.ruegnerlukas.strategygame.backend.core

import de.ruegnerlukas.strategygame.backend.TestFactories
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe

class TestServiceTest : StringSpec({

	"saying hello returns correct message" {
		val testHandler = TestFactories.buildTestHandler()
		testHandler.sayHello("John") shouldBe "Hello John!"
	}

})