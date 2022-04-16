package de.ruegnerlukas.strategygame.backend.shared

import org.slf4j.Logger
import org.slf4j.LoggerFactory

interface Logging {

	fun <T : Logging> T.log(): Logger {
		return LoggerFactory.getLogger(this::class.java)
	}

}