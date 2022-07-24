package de.ruegnerlukas.strategygame.backend.shared.dirty

import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.booleans.shouldBeFalse
import io.kotest.matchers.booleans.shouldBeTrue

class DirtyObjectTest : StringSpec({

	"A dirty-object is dirty when any child-value is modified" {
		val obj = TestObjectA("test", 42)
		obj.isDirty().shouldBeFalse()

		obj.name.set("new")
		obj.isDirty().shouldBeTrue()
	}

	"A dirty-object is dirty when any child-list is dirty" {
		val obj = TestObjectB("test", listOf(1, 2, 3))
		obj.isDirty().shouldBeFalse()

		obj.numbers.get().add(42)
		obj.isDirty().shouldBeTrue()
	}

	"A dirty-object is dirty when any child-object is dirty" {

		val obj = TestObjectC("obj", "test", 42)
		obj.isDirty().shouldBeFalse()

		obj.objA.get().name.set("new")
		obj.isDirty().shouldBeTrue()

	}

}) {

	companion object {

		internal class TestObjectA(name: String, size: Int) : DirtyObject() {
			val name = value(name)
			val size = value(size)
		}

		internal class TestObjectB(name: String, numbers: List<Int>) : DirtyObject() {
			val name = value(name)
			val numbers = list(numbers) { it }
		}

		internal class TestObjectC(type: String, name: String, size: Int) : DirtyObject() {
			val type = value(type)
			val objA = value(TestObjectA(name, size))
		}

		internal class TestObjectD(type: String, name: String, size: Int) : DirtyObject() {
			val type = value(type)
			val objA = valueNullable<TestObjectA>(null)
		}

	}

}