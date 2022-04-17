package de.ruegnerlukas.strategygame.backend.core.ports.required

/**
 * A test repository
 */
interface TestRepository {

	/**
	 * Get the message-string for the given message type
	 * @param type the type of the message-string
	 * @return the message-string, or a string with an error message
	 */
	fun getMessage(type: String): String

}