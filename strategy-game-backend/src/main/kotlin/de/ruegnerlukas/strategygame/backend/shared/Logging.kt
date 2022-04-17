package de.ruegnerlukas.strategygame.backend.shared

import org.slf4j.Logger
import org.slf4j.LoggerFactory

/**
 * Implement this interface to receive access a logger-object
 */
interface Logging {

	/**
	 * @return the logger-object for this class
	 */
	fun <T : Logging> T.log(): Logger {
		return LoggerFactory.getLogger(this::class.java)
	}

}