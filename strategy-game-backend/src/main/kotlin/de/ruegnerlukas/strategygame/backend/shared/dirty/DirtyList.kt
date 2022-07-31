package de.ruegnerlukas.strategygame.backend.shared.dirty

/**
 * A list of elements that also keeps track of added,removed (and dirty) elements.
 * Elements with duplicate ids provided by [idProvider] may result in undefined behaviour
 */
class DirtyList<T>(elements: Collection<T>, idProvider: (e: T) -> Any) : DirtyElement {

	private val initialElementIds = elements.map(idProvider).toHashSet()
	private val addedElements = mutableListOf<T>()
	private val removedElements = mutableListOf<T>()
	private val elements = ReportingList(
		elements,
		{ added ->
			val id = idProvider(added)
			removedElements.remove(added)
			if (!initialElementIds.contains(id)) {
				addedElements.add(added)
			}
		},
		{ allAdded ->
			removedElements.removeAll(allAdded)
			for (added in allAdded) {
				val id = idProvider(added)
				if (!initialElementIds.contains(id)) {
					addedElements.add(added)
				}
			}
		},
		{ removed ->
			val id = idProvider(removed)
			addedElements.remove(removed)
			if (initialElementIds.contains(id)) {
				removedElements.add(removed)
			}
		},
		{ allRemoved ->
			addedElements.removeAll(allRemoved)
			for (removed in allRemoved) {
				val id = idProvider(removed)
				if (initialElementIds.contains(id)) {
					removedElements.add(removed)
				}
			}
		}
	)


	/**
	 * get all current elements
	 */
	fun get() = elements


	/**
	 * get all added elements
	 */
	fun getAdded(): List<T> = addedElements


	/**
	 * get all removed elements
	 */
	fun getRemoved(): List<T> = removedElements


	/**
	 * get all updated elements (i.e. [DirtyElement]s that are dirty and not in the "added"-list)
	 */
	fun getUpdated(): List<T> {
		return elements.filter {
			when (it) {
				is DirtyElement -> it.isDirty() && !addedElements.contains(it)
				else -> false
			}
		}
	}


	/**
	 * get all added or updated (i.e. [DirtyElement]s that are dirty) elements
	 */
	fun getAddedOrUpdated(): List<T> {
		return elements.filter {
			if (addedElements.contains(it)) {
				true
			} else if (it is DirtyElement) {
				it.isDirty()
			} else {
				false
			}
		}
	}


	/**
	 * This is dirty if any elements where added, removed (or are dirty)
	 */
	override fun isDirty(): Boolean {
		return addedElements.isNotEmpty() || removedElements.isNotEmpty() || elements.any {
			when (it) {
				is DirtyElement -> it.isDirty()
				else -> false
			}
		}
	}

}