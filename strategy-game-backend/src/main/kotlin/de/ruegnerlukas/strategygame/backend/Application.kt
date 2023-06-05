package de.ruegnerlukas.strategygame.backend

import de.ruegnerlukas.strategygame.backend.app.engine.CustomNettyEngineMain
import de.ruegnerlukas.strategygame.backend.common.Logging

object ApplicationMode {
    const val DEV = "dev"
    const val PROD = "prod"
    const val DEFAULT = DEV
}

var APPLICATION_MODE = ApplicationMode.DEFAULT

/**
 * Entry point of the application
 */
fun main(args: Array<String>) {
    APPLICATION_MODE = getMode(args)
    Logging.create().info("Starting application in $APPLICATION_MODE mode.")
    CustomNettyEngineMain.main(APPLICATION_MODE, args)
}


private fun getMode(args: Array<String>): String {
    return if (args.isNotEmpty() && (args[0] == ApplicationMode.DEV || args[0] == ApplicationMode.PROD)) {
        args[0]
    } else {
        ApplicationMode.DEFAULT
    }
}