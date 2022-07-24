package de.ruegnerlukas.strategygame.backend.shared.dirty


/**
 * Is dirty when the value has been changed via [DirtyValue.set]
 */
class DirtyValue<T>(private var value: T, private var dirty: Boolean = false) : DirtyElement {

	fun get() = value

	override fun isDirty(): Boolean {
		if (dirty) {
			return true
		}
		if (value is DirtyElement) {
			return (value as DirtyElement).isDirty()
		}
		return false
	}

	fun set(value: T) {
		this.value = value
		dirty = true
	}
}