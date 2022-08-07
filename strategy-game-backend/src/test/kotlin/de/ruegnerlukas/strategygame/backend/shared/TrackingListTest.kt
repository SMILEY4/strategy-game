package de.ruegnerlukas.strategygame.backend.shared

import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.shouldBe

class TrackingListTest : StringSpec({

	"(de-) serialize to/from json" {

		val list = trackingListOf("a", "b", "c")
		list.add("d")
		list.remove("a")

		val strJson = Json.asString(list)
			.replace("\r", "")
			.replace("\n", "")
			.replace(" ", "")
			.also {
				it shouldBe "[\"b\",\"c\",\"d\"]"
			}

		Json.fromString<TrackingList<String>>(strJson).let {
			it shouldContainExactly listOf("b", "c", "d")
			it.getOriginalElements() shouldContainExactly listOf("b", "c", "d")
			it.getAddedElements().shouldBeEmpty()
			it.getRemovedElement().shouldBeEmpty()
		}

	}

})