package de.ruegnerlukas.strategygame.backend.shared.engine

import io.ktor.server.config.ApplicationConfig
import io.ktor.server.engine.addShutdownHook
import io.ktor.server.engine.loadCommonConfiguration
import io.ktor.server.engine.stop
import io.ktor.server.netty.NettyApplicationEngine
import java.util.concurrent.TimeUnit

/**
 * Netty engine
 * Mirrors [io.ktor.server.netty.EngineMain] but with custom code for loading application config
 */
object CustomNettyEngineMain {

	/**
	 * Main function for starting EngineMain with Netty
	 * Creates an embedded Netty application with an environment built from command line arguments.
	 * Mirrors [io.ktor.server.netty.EngineMain.main] but with custom code for loading application config
	 * @param environment the name of the environment. Defines, which config file(s) to load in addition to the base file(s) ( application.<env>.conf, application.<env>.local.conf )
	 */
	@JvmStatic
	fun main(environment: String, args: Array<String>) {
		val applicationEnvironment = commandLineEnvironment(environment, args) // <- this was changed to allow for custom configs
		val engine = NettyApplicationEngine(applicationEnvironment) { loadConfiguration(applicationEnvironment.config) }
		engine.addShutdownHook {
			engine.stop(3, 5, TimeUnit.SECONDS)
		}
		engine.start(true)
	}


	/**
	 * Mirrors [io.ktor.server.netty.EngineMain].loadConfiguration (exact same)
	 */
	private fun NettyApplicationEngine.Configuration.loadConfiguration(config: ApplicationConfig) {
		val deploymentConfig = config.config("ktor.deployment")
		loadCommonConfiguration(deploymentConfig)
		deploymentConfig.propertyOrNull("requestQueueLimit")?.getString()?.toInt()?.let {
			requestQueueLimit = it
		}
		deploymentConfig.propertyOrNull("runningLimit")?.getString()?.toInt()?.let {
			runningLimit = it
		}
		deploymentConfig.propertyOrNull("shareWorkGroup")?.getString()?.toBoolean()?.let {
			shareWorkGroup = it
		}
		deploymentConfig.propertyOrNull("responseWriteTimeoutSeconds")?.getString()?.toInt()?.let {
			responseWriteTimeoutSeconds = it
		}
		deploymentConfig.propertyOrNull("requestReadTimeoutSeconds")?.getString()?.toInt()?.let {
			requestReadTimeoutSeconds = it
		}
		deploymentConfig.propertyOrNull("tcpKeepAlive")?.getString()?.toBoolean()?.let {
			tcpKeepAlive = it
		}
	}

}