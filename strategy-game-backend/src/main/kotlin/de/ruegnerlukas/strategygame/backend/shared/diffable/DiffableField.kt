package de.ruegnerlukas.strategygame.backend.shared.diffable

abstract class DiffableClass {

	private val diffableFields = mutableListOf<DiffableField<*>>()

	fun isDifferent(): Boolean {
		return diffableFields.any { it.isDifferent() }
	}

	fun diffableString(value: String): DiffableField<String> {
		return DiffableField(value).apply { diffableFields.add(this) }
	}

	fun diffableNullableString(value: String?): DiffableField<String?> {
		return DiffableField(value).apply { diffableFields.add(this) }
	}

	fun diffableInt(value: Int): DiffableField<Int> {
		return DiffableField(value).apply { diffableFields.add(this) }
	}

	fun diffableNullableInt(value: Int?): DiffableField<Int?> {
		return DiffableField(value).apply { diffableFields.add(this) }
	}

	fun diffableBoolean(value: Boolean): DiffableField<Boolean> {
		return DiffableField(value).apply { diffableFields.add(this) }
	}

	fun diffableNullableBoolean(value: Boolean?): DiffableField<Boolean?> {
		return DiffableField(value).apply { diffableFields.add(this) }
	}

}


class DiffableField<T>(value: T) {

	private val prevValue: T = value
	private var nextValue: T = value
	private var isDiff = false

	fun getPrev() = prevValue

	fun get() = nextValue

	fun set(newValue: T) {
		nextValue = newValue
		isDiff = prevValue != nextValue
	}

	fun isDifferent() = isDiff
}


/**
 * TODO: two implementation ideas
 * 1. keep track of removed,added,(modified?) items in separate lists -> diff = list
 * 2. two lists: before, after + function that provides unique key for each item -> diff calculated via key
 */
class DiffableList<T>(items: List<T>) {

	private val items = mutableListOf(items)
	private val removedItems = mutableListOf<T>()
	private val addedItems = mutableListOf<T>()

	fun get() = items

	fun add(item: T) {

	}

	fun remove(item: T) {
	}

	fun isDifferent() = removedItems.isNotEmpty() || addedItems.isNotEmpty()

}