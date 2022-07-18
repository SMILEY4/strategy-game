package de.ruegnerlukas.strategygame.backend.shared.diffable

fun main() {

	val model = DiffTestModel("test-name", 42)

	println(model.name.get())
	println(model.name.getPrev())
	println(model.name.isDifferent())
	println(model.isDifferent())

	println(model.name.set("new-name"))

	println(model.name.get())
	println(model.name.getPrev())
	println(model.name.isDifferent())
	println(model.isDifferent())

	println(model.name.set("test-name"))

	println(model.name.get())
	println(model.name.getPrev())
	println(model.name.isDifferent())
	println(model.isDifferent())

}


class DiffTestModel(name: String, amount: Int) : DiffableClass() {
	val name = diffableString(name)
	val amount = diffableInt(amount)
}