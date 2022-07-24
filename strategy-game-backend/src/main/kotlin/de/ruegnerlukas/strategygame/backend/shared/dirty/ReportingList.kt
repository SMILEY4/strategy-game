package de.ruegnerlukas.strategygame.backend.shared.dirty

class ReportingList<T>(
	elements: Collection<T>,
	private val onAdd: (added: T) -> Unit,
	private val onAddAll: (added: Collection<T>) -> Unit,
	private val onRemove: (removed: T) -> Unit,
	private val onRemoveAll: (removed: Collection<T>) -> Unit,
	) : ArrayList<T>(elements) {

	override fun add(element: T): Boolean {
		return super.add(element).also {
			onAdd(element)
		}
	}

	override fun add(index: Int, element: T) {
		super.add(index, element).also {
			onAdd(element)
		}
	}

	override fun addAll(elements: Collection<T>): Boolean {
		return super.addAll(elements).also {
			onAddAll(elements)
		}
	}

	override fun addAll(index: Int, elements: Collection<T>): Boolean {
		return super.addAll(index, elements).also {
			onAddAll(elements)
		}
	}

	override fun clear() {
		val removed = this.toList()
		super.clear()
		onRemoveAll(removed)
	}

	override fun remove(element: T): Boolean {
		return super.remove(element).also {
			if (it) {
				onRemove(element)
			}
		}
	}

	override fun removeAll(elements: Collection<T>): Boolean {
		return super.removeAll(elements).also {
			if (it) {
				onRemoveAll(elements)
			}
		}
	}

	override fun removeAt(index: Int): T {
		return super.removeAt(index).also {
			onRemove(it)
		}
	}

	override fun set(index: Int, element: T): T {
		return super.set(index, element).also {
			onRemove(it)
			onAdd(element)
		}
	}
}