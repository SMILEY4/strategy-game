package de.ruegnerlukas.strategygame.backend

import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.engine.CustomNettyEngineMain

/**
 * Entry point of the application
 */
fun main(args: Array<String>) {
	val mode = getMode(args)
	Logging.create().info("Starting application in $mode mode.")
	CustomNettyEngineMain.main(mode, args)
}


private const val MODE_DEV = "dev"
private const val MODE_PROD = "prod"
private const val MODE_DEFAULT = MODE_DEV

private fun getMode(args: Array<String>): String {
	return if (args.isNotEmpty() && (args[0] == MODE_DEV || args[0] == MODE_PROD)) {
		args[0]
	} else {
		MODE_DEFAULT
	}
}
