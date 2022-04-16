package de.ruegnerlukas.strategygame.backend.external.persistence

import de.ruegnerlukas.strategygame.backend.core.ports.required.TestRepository

class TestRepositoryImpl : TestRepository {

	override fun getMessage(type: String): String {
		return when (type) {
			"HELLO" -> "Hello [name]!"
			else -> "Error: unknown message type"
		}
	}

}