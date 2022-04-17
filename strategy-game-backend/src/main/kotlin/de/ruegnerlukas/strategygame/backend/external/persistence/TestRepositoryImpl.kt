package de.ruegnerlukas.strategygame.backend.external.persistence

import de.ruegnerlukas.strategygame.backend.core.ports.required.TestRepository

/**
 * Implementation of a test repository
 */
class TestRepositoryImpl : TestRepository {

	override fun getMessage(type: String): String {
		return when (type) {
			"HELLO" -> "Hello [name]!"
			else -> "Error: unknown message type"
		}
	}

}