package de.ruegnerlukas.strategygame.backend.shared

import mu.KotlinLogging
import org.slf4j.Logger

/**
 * Implement this interface to receive access to a logger-object
 */
interface Logging {

	/**
	 * @return the logger-object for this class
	 */
	fun <T : Logging> T.log(): Logger {
		return KotlinLogging.logger {}
	}

	companion object {
		fun create(): Logger {
			return KotlinLogging.logger {}
		}
	}

}