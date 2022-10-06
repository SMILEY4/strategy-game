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
		return KotlinLogging.logger(this::class.java.name)
	}

	companion object {
		fun create(name: String? = null): Logger {
			return if(name == null) {
				KotlinLogging.logger {}
			} else {
				KotlinLogging.logger(name)
			}
		}
	}

}