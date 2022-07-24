package de.ruegnerlukas.strategygame.backend.shared.dirty

import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.booleans.shouldBeFalse
import io.kotest.matchers.booleans.shouldBeTrue
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldContainExactly

class DirtyListWithDirtyValuesTests : StringSpec({

	"adding an elements marks the list as dirty" {

		val list = DirtyList(listOf(DirtyValue("A"), DirtyValue("B"))) { it.hashCode() }
		list.apply {
			getAdded().shouldBeEmpty()
			getRemoved().shouldBeEmpty()
			getUpdated().shouldBeEmpty()
			isDirty().shouldBeFalse()
		}

		list.get().add(DirtyValue("X"))
		list.apply {
			get().map { it.get() }.shouldContainExactly("A", "B", "X")
			getAdded().map { it.get() }.shouldContainExactly("X")
			getRemoved().shouldBeEmpty()
			getUpdated().shouldBeEmpty()
			isDirty().shouldBeTrue()
		}

	}

	"removing an elements marks the list as dirty" {

		val list = DirtyList(listOf(DirtyValue("A"), DirtyValue("B"), DirtyValue("X"))) { it.hashCode() }
		list.apply {
			get().map { it.get() }.shouldContainExactly("A", "B", "X")
			getAdded().shouldBeEmpty()
			getRemoved().shouldBeEmpty()
			getUpdated().shouldBeEmpty()
			isDirty().shouldBeFalse()
		}

		list.get().remove(list.get().find { it.get() == "X" })
		list.apply {
			get().map { it.get() }.shouldContainExactly("A", "B")
			getAdded().shouldBeEmpty()
			getRemoved().map { it.get() }.shouldContainExactly("X")
			getUpdated().shouldBeEmpty()
			isDirty().shouldBeTrue()
		}

	}


	"adding and removing a new element does not change the list" {

		val list = DirtyList(listOf(DirtyValue("A"), DirtyValue("B"))) { it.hashCode() }
		list.apply {
			get().map { it.get() }.shouldContainExactly("A", "B")
			getAdded().shouldBeEmpty()
			getRemoved().shouldBeEmpty()
			getUpdated().shouldBeEmpty()
			isDirty().shouldBeFalse()
		}

		list.get().add(DirtyValue("X"))
		list.apply {
			get().map { it.get() }.shouldContainExactly("A", "B", "X")
			getAdded().map { it.get() }.shouldContainExactly("X")
			getRemoved().shouldBeEmpty()
			getUpdated().shouldBeEmpty()
			isDirty().shouldBeTrue()
		}

		list.get().remove(list.get().find { it.get() == "X" })
		list.apply {
			get().map { it.get() }.shouldContainExactly("A", "B")
			getAdded().shouldBeEmpty()
			getRemoved().shouldBeEmpty()
			getUpdated().shouldBeEmpty()
			isDirty().shouldBeFalse()
		}

	}


	"removing and adding an element does not change the list" {

		val list = DirtyList(listOf(DirtyValue("A"), DirtyValue("B"), DirtyValue("X"))) { it.hashCode() }
		list.apply {
			get().map { it.get() }.shouldContainExactly("A", "B", "X")
			getAdded().shouldBeEmpty()
			getRemoved().shouldBeEmpty()
			getUpdated().shouldBeEmpty()
			isDirty().shouldBeFalse()
		}

		val removed = list.get().find { it.get() == "X" }!!
		list.get().remove(removed)
		list.apply {
			get().map { it.get() }.shouldContainExactly("A", "B")
			getAdded().shouldBeEmpty()
			getRemoved().map { it.get() }.shouldContainExactly("X")
			getUpdated().shouldBeEmpty()
			isDirty().shouldBeTrue()
		}

		list.get().add(removed)
		list.apply {
			get().map { it.get() }.shouldContainExactly("A", "B", "X")
			getAdded().shouldBeEmpty()
			getRemoved().shouldBeEmpty()
			getUpdated().shouldBeEmpty()
			isDirty().shouldBeFalse()
		}

	}

	"setting an element at a position adds the removed,added" {

		val list = DirtyList(listOf(DirtyValue("A"), DirtyValue("B"), DirtyValue("C"))) { it.hashCode() }
		list.apply {
			get().map { it.get() }.shouldContainExactly("A", "B", "C")
			getAdded().shouldBeEmpty()
			getRemoved().shouldBeEmpty()
			getUpdated().shouldBeEmpty()
			isDirty().shouldBeFalse()
		}

		list.get()[1] = DirtyValue("X")
		list.apply {
			get().map { it.get() }.shouldContainExactly("A", "X", "C")
			getAdded().map { it.get() }.shouldContainExactly("X")
			getRemoved().map { it.get() }.shouldContainExactly("B")
			getUpdated().shouldBeEmpty()
			isDirty().shouldBeTrue()
		}

	}

	"updating an existing dirty-value in the list marks it as updated and the list as dirty" {

		val list = DirtyList(listOf(DirtyValue("A"), DirtyValue("X"))) { it.hashCode() }
		list.apply {
			get().map { it.get() }.shouldContainExactly("A", "X")
			getAdded().shouldBeEmpty()
			getRemoved().shouldBeEmpty()
			getUpdated().shouldBeEmpty()
			isDirty().shouldBeFalse()
		}

		list.get().find { it.get() == "X" }!!.set("X*")
		list.apply {
			get().map { it.get() }.shouldContainExactly("A", "X*")
			getAdded().shouldBeEmpty()
			getRemoved().shouldBeEmpty()
			getUpdated().map { it.get() }.shouldContainExactly("X*")
			isDirty().shouldBeTrue()
		}
	}

	"updating an added dirty-value in the list marks it as updated and the list as dirty" {

		val list = DirtyList(listOf(DirtyValue("A"))) { it.hashCode() }
		list.get().add(DirtyValue("X"))
		list.apply {
			get().map { it.get() }.shouldContainExactly("A", "X")
			getAdded().map { it.get() }.shouldContainExactly("X")
			getRemoved().shouldBeEmpty()
			getUpdated().shouldBeEmpty()
			isDirty().shouldBeTrue()
		}

		list.get().find { it.get() == "X" }!!.set("X*")
		list.apply {
			get().map { it.get() }.shouldContainExactly("A", "X*")
			getAdded().map { it.get() }.shouldContainExactly("X*")
			getRemoved().shouldBeEmpty()
			getUpdated().shouldBeEmpty()
			isDirty().shouldBeTrue()
		}
	}

})