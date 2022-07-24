package de.ruegnerlukas.strategygame.backend.shared.dirty

/**
 * An element with a "dirty"-flag indicating that this element has been modified
 */
interface DirtyElement {
	fun isDirty(): Boolean
}