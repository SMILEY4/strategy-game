package de.ruegnerlukas.strategygame.backend

/**
 * Entry point of the application
 */
fun main(args: Array<String>) {
	io.ktor.server.netty.EngineMain.main(buildArgs(args))
}

fun buildArgs(suppliedArgs: Array<String>): Array<String> {
	val args = mutableListOf(*suppliedArgs)
	args.add("-config=src/main/resources/application.prod.conf")
	return args.toTypedArray()
}
