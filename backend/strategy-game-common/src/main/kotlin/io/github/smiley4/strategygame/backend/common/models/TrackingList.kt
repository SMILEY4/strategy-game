package io.github.smiley4.strategygame.backend.common.models

fun <T> trackingListOf() = TrackingList<T>(emptyList())

fun <T> trackingListOf(vararg elements: T) = TrackingList(elements.toList())

fun <T> Collection<T>.tracking() = TrackingList(this)

class TrackingList<T>(elements: Collection<T>) : MutableList<T> {

	private val list = mutableListOf<T>().apply { addAll(elements) }
	private val originalElements = mutableListOf<T>().apply { addAll(elements) }
	private val removedElements = mutableSetOf<T>()
	private val addedElements = mutableSetOf<T>()


	fun getOriginalElements(): List<T> = originalElements

	fun getRemovedElements(): Set<T> = removedElements

	fun getAddedElements(): Set<T> = addedElements

	override val size = list.size

	override fun clear() {
		removedElements.addAll(list)
		addedElements.clear()
		list.clear()
	}

	override fun addAll(elements: Collection<T>): Boolean {
		addedElements.addAll(elements)
		removedElements.removeAll(elements.toSet())
		return list.addAll(elements)
	}

	override fun addAll(index: Int, elements: Collection<T>): Boolean {
		addedElements.addAll(elements)
		removedElements.removeAll(elements.toSet())
		return list.addAll(index, elements)
	}

	override fun add(index: Int, element: T) {
		addedElements.add(element)
		removedElements.remove(element)
		return list.add(index, element)
	}

	override fun add(element: T): Boolean {
		addedElements.add(element)
		removedElements.remove(element)
		return list.add(element)
	}

	override fun get(index: Int) = list[index]

	override fun isEmpty() = list.isEmpty()

	override fun iterator() = list.iterator()

	override fun listIterator() = list.listIterator()

	override fun listIterator(index: Int) = list.listIterator(index)

	override fun removeAt(index: Int): T {
		return list.removeAt(index).also {
			removedElements.add(it)
			addedElements.remove(it)
		}
	}

	override fun subList(fromIndex: Int, toIndex: Int) = list.subList(fromIndex, toIndex)

	override fun set(index: Int, element: T): T {
		return list.set(index, element).also {
			removedElements.add(it)
			addedElements.remove(it)
			removedElements.remove(element)
			addedElements.add(element)
		}
	}

	override fun retainAll(elements: Collection<T>): Boolean {
		throw UnsupportedOperationException()
	}

	override fun removeAll(elements: Collection<T>): Boolean {
		throw UnsupportedOperationException()

	}

	override fun remove(element: T): Boolean {
		return list.remove(element).also {
			if (it) {
				removedElements.add(element)
				addedElements.remove(element)
			}
		}
	}

	override fun lastIndexOf(element: T) = list.lastIndexOf(element)

	override fun indexOf(element: T) = list.indexOf(element)

	override fun containsAll(elements: Collection<T>) = list.containsAll(elements)

	override fun contains(element: T) = list.contains(element)
}