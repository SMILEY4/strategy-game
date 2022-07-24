package de.ruegnerlukas.strategygame.backend.shared.dirty


/**
 * Is dirty when the value has been changed via [NullableDirtyValue.set]
 */
class NullableDirtyValue<T>(private var value: T?, private var dirty: Boolean = false) : DirtyElement {

	fun get() = value

	override fun isDirty(): Boolean {
		if (dirty) {
			return true
		}
		if (value != null && value is NullableDirtyValue<*>) {
			return (value as NullableDirtyValue<*>).isDirty()
		}
		return false
	}

	fun set(value: T) {
		this.value = value
		dirty = true
	}
}