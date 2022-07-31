package de.ruegnerlukas.strategygame.backend.shared.dirty

import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.booleans.shouldBeFalse
import io.kotest.matchers.booleans.shouldBeTrue
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldContainExactly

class DirtyListWithPrimitivesTests : StringSpec({

	"adding an elements marks the list as dirty" {

		val list = DirtyList(listOf("A", "B")) { it }
		list.apply {
			get().shouldContainExactly("A", "B")
			getAdded().shouldBeEmpty()
			getRemoved().shouldBeEmpty()
			getUpdated().shouldBeEmpty()
			isDirty().shouldBeFalse()
		}

		list.get().add("X")
		list.apply {
			get().shouldContainExactly("A", "B", "X")
			getAdded().shouldContainExactly("X")
			getRemoved().shouldBeEmpty()
			getUpdated().shouldBeEmpty()
			isDirty().shouldBeTrue()
		}

	}

	"removing an elements marks the list as dirty" {

		val list = DirtyList(listOf("A", "B", "X")) { it }
		list.apply {
			get().shouldContainExactly("A", "B", "X")
			getAdded().shouldBeEmpty()
			getRemoved().shouldBeEmpty()
			getUpdated().shouldBeEmpty()
			isDirty().shouldBeFalse()
		}

		list.get().remove("X")
		list.apply {
			get().shouldContainExactly("A", "B")
			getAdded().shouldBeEmpty()
			getRemoved().shouldContainExactly("X")
			getUpdated().shouldBeEmpty()
			isDirty().shouldBeTrue()
		}

	}


	"adding and removing a new element does not change the list" {

		val list = DirtyList(listOf("A", "B")) { it }
		list.apply {
			get().shouldContainExactly("A", "B")
			getAdded().shouldBeEmpty()
			getRemoved().shouldBeEmpty()
			getUpdated().shouldBeEmpty()
			isDirty().shouldBeFalse()
		}

		list.get().add("X")
		list.apply {
			get().shouldContainExactly("A", "B", "X")
			getAdded().shouldContainExactly("X")
			getRemoved().shouldBeEmpty()
			getUpdated().shouldBeEmpty()
			isDirty().shouldBeTrue()
		}

		list.get().remove("X")
		list.apply {
			get().shouldContainExactly("A", "B")
			getAdded().shouldBeEmpty()
			getRemoved().shouldBeEmpty()
			getUpdated().shouldBeEmpty()
			isDirty().shouldBeFalse()
		}

	}


	"removing and adding an element does not change the list" {

		val list = DirtyList(listOf("A", "B", "X")) { it }
		list.apply {
			get().shouldContainExactly("A", "B", "X")
			getAdded().shouldBeEmpty()
			getRemoved().shouldBeEmpty()
			getUpdated().shouldBeEmpty()
			isDirty().shouldBeFalse()
		}

		list.get().remove("X")
		list.apply {
			get().shouldContainExactly("A", "B")
			getAdded().shouldBeEmpty()
			getRemoved().shouldContainExactly("X")
			getUpdated().shouldBeEmpty()
			isDirty().shouldBeTrue()
		}

		list.get().add("X")
		list.apply {
			get().shouldContainExactly("A", "B", "X")
			getAdded().shouldBeEmpty()
			getRemoved().shouldBeEmpty()
			getUpdated().shouldBeEmpty()
			isDirty().shouldBeFalse()
		}

	}


	"setting an element at a position adds the removed,added" {

		val list = DirtyList(listOf("A", "B", "C")) { it }
		list.apply {
			get().shouldContainExactly("A", "B", "C")
			getAdded().shouldBeEmpty()
			getRemoved().shouldBeEmpty()
			getUpdated().shouldBeEmpty()
			isDirty().shouldBeFalse()
		}

		list.get()[1] = "X"
		list.apply {
			get().shouldContainExactly("A", "X", "C")
			getAdded().shouldContainExactly("X")
			getRemoved().shouldContainExactly("B")
			getUpdated().shouldBeEmpty()
			isDirty().shouldBeTrue()
		}

	}

})