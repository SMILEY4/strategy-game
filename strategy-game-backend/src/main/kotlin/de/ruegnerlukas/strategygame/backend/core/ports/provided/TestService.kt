package de.ruegnerlukas.strategygame.backend.core.ports.provided

/**
 * A handler for test-logic
 */
interface TestService {

	/**
	 * Say hello to the given name
	 * @param name the name
	 * @return the greeting as a string
	 */
	fun sayHello(name: String): String

}