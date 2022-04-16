package de.ruegnerlukas.strategygame.backend.core.ports.required

interface TestRepository {

	fun getMessage(type: String): String

}