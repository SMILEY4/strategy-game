package io.github.smiley4.strategygame.backend.common.logging

import mu.two.KLogger
import mu.two.KotlinLogging

/**
 * Implement this interface to receive access to a logger-object
 */
interface Logging {

	/**
	 * @return the logger-object for this class
	 */
	fun <T : Logging> T.log(): KLogger {
		return KotlinLogging.logger(this::class.java.name)
	}

	companion object {
		fun create(name: String? = null): KLogger {
			return if(name == null) {
				KotlinLogging.logger {}
			} else {
				KotlinLogging.logger(name)
			}
		}
	}

}