package de.ruegnerlukas.strategygame.backend.shared.dirty

import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.booleans.shouldBeFalse
import io.kotest.matchers.booleans.shouldBeTrue
import io.kotest.matchers.shouldBe

class DirtyValueTest : StringSpec({

	"A dirty-value is dirty when modified" {

		val value = DirtyValue("Old")
		value.apply {
			get().shouldBe("Old")
			isDirty().shouldBeFalse()
		}

		value.set("New")
		value.apply {
			get().shouldBe("New")
			isDirty().shouldBeTrue()
		}

	}

})