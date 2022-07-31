package de.ruegnerlukas.strategygame.backend.shared.dirty

/**
 * A complex dirty object with children. Children have to be created via the functions provided by this [DirtyObject]
 */
abstract class DirtyObject : DirtyElement {

	private val children = mutableListOf<DirtyElement>()


	/**
	 * Is dirty when any child is dirty
	 */
	override fun isDirty() = children.any { it.isDirty() }


	/**
	 * A simple dirty value
	 */
	fun <T> value(value: T): DirtyValue<T> {
		return DirtyValue(value).also {
			children.add(it)
		}
	}

	/**
	 * A simple nullable dirty value
	 */
	fun <T> valueNullable(value: T?): NullableDirtyValue<T> {
		return NullableDirtyValue(value).also {
			children.add(it)
		}
	}

	/**
	 * A list of dirty values
	 */
	fun <T> list(items: Collection<T>, idProvider: (e: T) -> Any): DirtyList<T> {
		return DirtyList(items, idProvider).also {
			children.add(it)
		}
	}

}
