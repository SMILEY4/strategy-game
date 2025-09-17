package io.github.smiley4.strategygame.backend.commondata.utils

fun <T> trackingListOf() = TrackingList<T>(emptyList())

fun <T> trackingListOf(vararg elements: T) = TrackingList(elements.toList())

fun <T> Collection<T>.tracking() = TrackingList(this)

class TrackingList<T>(elements: Collection<T>) : MutableList<T> {

    private val backingList = mutableListOf<T>().apply { addAll(elements) }
    private val originalElements = mutableListOf<T>().apply { addAll(elements) }
    private val removedElements = mutableSetOf<T>()
    private val addedElements = mutableSetOf<T>()


    fun getOriginalElements(): List<T> = originalElements

    fun getRemovedElements(): Set<T> = removedElements

    fun getAddedElements(): Set<T> = addedElements

    override val size: Int get() = backingList.size

    override fun clear() {
        removedElements.addAll(backingList)
        addedElements.clear()
        backingList.clear()
    }

    override fun addAll(elements: Collection<T>): Boolean {
        addedElements.addAll(elements)
        removedElements.removeAll(elements.toSet())
        return backingList.addAll(elements)
    }

    override fun addAll(index: Int, elements: Collection<T>): Boolean {
        addedElements.addAll(elements)
        removedElements.removeAll(elements.toSet())
        return backingList.addAll(index, elements)
    }

    override fun add(index: Int, element: T) {
        markAdded(element)
        return backingList.add(index, element)
    }

    override fun add(element: T): Boolean {
        markAdded(element)
        return backingList.add(element)
    }

    override fun get(index: Int) = backingList[index]

    override fun isEmpty() = backingList.isEmpty()

    override fun iterator() = MutableIterator(this)

    override fun listIterator() = MutableListIterator(0, this)

    override fun listIterator(index: Int) = MutableListIterator(index, this)

    override fun removeAt(index: Int): T {
        return backingList.removeAt(index).also {
            markRemoved(it)
        }
    }

    override fun subList(fromIndex: Int, toIndex: Int) = backingList.subList(fromIndex, toIndex)

    override fun set(index: Int, element: T): T {
        return backingList.set(index, element).also {
            markRemoved(it)
            markAdded(element)
        }
    }

    override fun retainAll(elements: Collection<T>): Boolean {
        throw UnsupportedOperationException()
    }

    override fun removeAll(elements: Collection<T>): Boolean {
        return elements.map { remove(it) }.any()
    }

    override fun remove(element: T): Boolean {
        return backingList.remove(element).also {
            if (it) {
                markRemoved(element)
            }
        }
    }

    override fun lastIndexOf(element: T) = backingList.lastIndexOf(element)

    override fun indexOf(element: T) = backingList.indexOf(element)

    override fun containsAll(elements: Collection<T>) = backingList.containsAll(elements)

    override fun contains(element: T) = backingList.contains(element)

    private fun markRemoved(element: T) {
        removedElements.add(element)
        addedElements.remove(element)
    }

    private fun markAdded(element: T) {
        addedElements.add(element)
        removedElements.remove(element)
    }

    class MutableIterator<T>(private val list: TrackingList<T>) : kotlin.collections.MutableIterator<T> {

        private val iterator = list.backingList.iterator()
        private var currentElement: T? = null

        override fun hasNext(): Boolean {
            return iterator.hasNext()
        }

        override fun next(): T {
            return iterator.next()
                .also { currentElement = it }
        }

        override fun remove() {
            iterator.remove()
            currentElement?.also { list.markRemoved(it) }
        }

    }

    class MutableListIterator<T>(index: Int, private val list: TrackingList<T>) : kotlin.collections.MutableListIterator<T> {

        private val iterator = list.backingList.listIterator(index)
        private var currentElement: T? = null

        override fun add(element: T) {
            iterator.add(element)
            list.markAdded(element)
        }

        override fun hasNext(): Boolean {
            return iterator.hasNext()
        }

        override fun hasPrevious(): Boolean {
            return iterator.hasPrevious()
        }

        override fun next(): T {
            return iterator.next()
                .also { currentElement = it }
        }

        override fun nextIndex(): Int {
            return iterator.nextIndex()
        }

        override fun previous(): T {
            return iterator.previous()
                .also { currentElement = it }
        }

        override fun previousIndex(): Int {
            return iterator.nextIndex()
        }

        override fun remove() {
            iterator.remove()
            currentElement?.also { list.markRemoved(it) }
        }

        override fun set(element: T) {
            iterator.set(element)
            currentElement?.also {
                list.markRemoved(it)
                list.markAdded(element)
            }
        }

    }
}