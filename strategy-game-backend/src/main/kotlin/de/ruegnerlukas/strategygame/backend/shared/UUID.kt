package de.ruegnerlukas.strategygame.backend.shared


object UUID {
	fun gen() = java.util.UUID.randomUUID().toString()
}
