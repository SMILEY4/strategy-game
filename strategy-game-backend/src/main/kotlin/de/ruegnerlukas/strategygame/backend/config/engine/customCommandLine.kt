package de.ruegnerlukas.strategygame.backend.config.engine

import io.ktor.server.config.tryGetString
import io.ktor.server.config.tryGetStringList
import io.ktor.server.engine.ApplicationEngineEnvironment
import io.ktor.server.engine.applicationEngineEnvironment
import io.ktor.server.engine.connector
import io.ktor.util.PlatformUtils
import io.ktor.util.logging.KtorSimpleLogger


/**
 * Mirrors: [io.ktor.server.engine.ConfigKeys] (exact same)
 */
internal object ConfigKeys {
	val applicationIdPath = "ktor.application.id"
	val hostConfigPath = "ktor.deployment.host"
	val hostPortPath = "ktor.deployment.port"
	val hostWatchPaths = "ktor.deployment.watch"
	val rootPathPath = "ktor.deployment.rootPath"
	val hostSslPortPath = "ktor.deployment.sslPort"
	val hostSslKeyStore = "ktor.security.ssl.keyStore"
	val hostSslKeyAlias = "ktor.security.ssl.keyAlias"
	val hostSslKeyStorePassword = "ktor.security.ssl.keyStorePassword"
	val hostSslPrivateKeyPassword = "ktor.security.ssl.privateKeyPassword"
	val developmentModeKey = "ktor.development"
}


/**
 * Creates an [ApplicationEngineEnvironment] instance from command line arguments
 * Mirrors: "io.ktor.server.engine.CommandLine.commandLineEnvironment" with custom config loading
 * @param envName the name of the environment. Defines, which config file(s) to load in addition to the base file(s) ( application.<env>.conf, application.<env>.local.conf )
 */
fun commandLineEnvironment(envName: String, args: Array<String>): ApplicationEngineEnvironment {
	val argumentsPairs = args.mapNotNull { it.splitPair('=') }.toMap()
	val configuration = buildApplicationConfig(envName)  // <- this was changed to allow for custom configs
	val applicationId = configuration.tryGetString(ConfigKeys.applicationIdPath) ?: "Application"
	val logger = KtorSimpleLogger(applicationId)

	val rootPath = argumentsPairs["-path"] ?: configuration.tryGetString(ConfigKeys.rootPathPath) ?: ""

	val environment = applicationEngineEnvironment {
		log = logger

		configurePlatformProperties(args)

		config = configuration

		this.rootPath = rootPath

		val host = argumentsPairs["-host"] ?: configuration.tryGetString(ConfigKeys.hostConfigPath) ?: "0.0.0.0"
		val port = argumentsPairs["-port"] ?: configuration.tryGetString(ConfigKeys.hostPortPath)
		val sslPort = argumentsPairs["-sslPort"] ?: configuration.tryGetString(ConfigKeys.hostSslPortPath)
		val sslKeyStorePath = argumentsPairs["-sslKeyStore"] ?: configuration.tryGetString(ConfigKeys.hostSslKeyStore)
		val sslKeyStorePassword = configuration.tryGetString(ConfigKeys.hostSslKeyStorePassword)?.trim()
		val sslPrivateKeyPassword = configuration.tryGetString(ConfigKeys.hostSslPrivateKeyPassword)?.trim()
		val sslKeyAlias = configuration.tryGetString(ConfigKeys.hostSslKeyAlias) ?: "mykey"

		developmentMode = configuration.tryGetString(ConfigKeys.developmentModeKey)
			?.let { it.toBoolean() } ?: PlatformUtils.IS_DEVELOPMENT_MODE

		if (port != null) {
			connector {
				this.host = host
				this.port = port.toInt()
			}
		}

		if (sslPort != null) {
			configureSSLConnectors(
				host,
				sslPort,
				sslKeyStorePath,
				sslKeyStorePassword,
				sslPrivateKeyPassword,
				sslKeyAlias
			)
		}

		if (port == null && sslPort == null) {
			throw IllegalArgumentException(
				"Neither port nor sslPort specified. Use command line options -port/-sslPort " +
						"or configure connectors in application.conf"
			)
		}

		(argumentsPairs["-watch"]?.split(",") ?: configuration.tryGetStringList(ConfigKeys.hostWatchPaths))?.let {
			watchPaths = it
		}
	}

	return environment
}


/**
 * Mirrors [io.ktor.server.engine.splitPair] (exact same)
 */
internal fun String.splitPair(ch: Char): Pair<String, String>? = indexOf(ch).let { idx ->
	when (idx) {
		-1 -> null
		else -> Pair(take(idx), drop(idx + 1))
	}
}
