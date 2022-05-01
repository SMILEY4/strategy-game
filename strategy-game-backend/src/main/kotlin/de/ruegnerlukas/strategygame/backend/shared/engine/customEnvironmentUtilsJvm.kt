package de.ruegnerlukas.strategygame.backend.shared.engine

import com.typesafe.config.Config
import com.typesafe.config.ConfigFactory
import com.typesafe.config.ConfigRenderOptions
import io.ktor.server.application.ApplicationEnvironment
import io.ktor.server.config.ApplicationConfig
import io.ktor.server.config.HoconApplicationConfig
import io.ktor.server.config.tryGetString
import io.ktor.server.engine.ApplicationEngineEnvironmentBuilder
import io.ktor.server.engine.sslConnector
import io.ktor.util.logging.KtorSimpleLogger
import io.ktor.util.toCharArray
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import java.io.File
import java.io.FileInputStream
import java.net.URI
import java.net.URLClassLoader
import java.security.KeyStore


/**
 * Build the custom config
 * @param envName the name of the environment. Defines, which config file(s) to load in addition to the base file(s) ( application.<env>.conf, application.<env>.local.conf )
 */
private fun buildConfig(envName: String): Config {

	val baseConfig = ConfigFactory.parseResources("application.conf")
	val baseLocalConfig = ConfigFactory.parseResources("application.local.conf")
	val envConfig = ConfigFactory.parseResources("application.$envName.conf")
	val envLocalConfig = ConfigFactory.parseResources("application.$envName.local.conf")

	val config = ConfigFactory.load()
		.withFallback(envLocalConfig)
		.withFallback(envConfig)
		.withFallback(baseLocalConfig)
		.withFallback(baseConfig)

	val jsonConfig = config.root().render(
		ConfigRenderOptions
			.defaults()
			.setOriginComments(false)
			.setComments(false)
			.setFormatted(true)
	)

	val json = Json { ignoreUnknownKeys = true }
	de.ruegnerlukas.strategygame.backend.shared.config.Config.set(json.decodeFromString(jsonConfig))

	return config
}


/**
 * Mirrors [io.ktor.server.engine.buildApplicationConfig]
 * @param envName the name of the environment. Defines, which config file(s) to load in addition to the base file(s) ( application.<env>.conf, application.<env>.local.conf )
 */
internal fun buildApplicationConfig(envName: String): ApplicationConfig {
	val combinedConfig = buildConfig(envName) // <- this was changed
	val applicationId = combinedConfig.tryGetString(ConfigKeys.applicationIdPath) ?: "Application"
	val logger = KtorSimpleLogger(applicationId)

//	val contentHiddenValue = ConfigValueFactory.fromAnyRef("***", "Content hidden")
	if (combinedConfig.hasPath("ktor")) {
//		logger.trace(
//			combinedConfig.getObject("ktor")
//				.withoutKey("security")
//				.withValue("security", contentHiddenValue)
//				.render()
//		)
	} else {
		logger.trace(
			"No configuration provided: neither application.conf " +
					"nor system properties nor command line options (-config or -P:ktor...=) provided"
		)
	}

	return HoconApplicationConfig(combinedConfig)
}


/**
 * Mirrors [io.ktor.server.engine.configureSSLConnectors]
 */
internal fun ApplicationEngineEnvironmentBuilder.configureSSLConnectors(
	host: String,
	sslPort: String,
	sslKeyStorePath: String?,
	sslKeyStorePassword: String?,
	sslPrivateKeyPassword: String?,
	sslKeyAlias: String
) {
	if (sslKeyStorePath == null) {
		throw IllegalArgumentException(
			"SSL requires keystore: use -sslKeyStore=path or ${ConfigKeys.hostSslKeyStore} config"
		)
	}
	if (sslKeyStorePassword == null) {
		throw IllegalArgumentException(
			"SSL requires keystore password: use ${ConfigKeys.hostSslKeyStorePassword} config"
		)
	}
	if (sslPrivateKeyPassword == null) {
		throw IllegalArgumentException(
			"SSL requires certificate password: use ${ConfigKeys.hostSslPrivateKeyPassword} config"
		)
	}

	val keyStoreFile = File(sslKeyStorePath).let { file ->
		if (file.exists() || file.isAbsolute) file else File(".", sslKeyStorePath).absoluteFile
	}
	val keyStore = KeyStore.getInstance("JKS").apply {
		FileInputStream(keyStoreFile).use {
			load(it, sslKeyStorePassword.toCharArray())
		}

		requireNotNull(getKey(sslKeyAlias, sslPrivateKeyPassword.toCharArray())) {
			"The specified key $sslKeyAlias doesn't exist in the key store $sslKeyStorePath"
		}
	}

	sslConnector(
		keyStore,
		sslKeyAlias,
		{ sslKeyStorePassword.toCharArray() },
		{ sslPrivateKeyPassword.toCharArray() }
	) {
		this.host = host
		this.port = sslPort.toInt()
		this.keyStorePath = keyStoreFile
	}
}


/**
 * Mirrors [io.ktor.server.engine.configurePlatformProperties]
 */
internal fun ApplicationEngineEnvironmentBuilder.configurePlatformProperties(args: Array<String>) {
	val argumentsPairs = args.mapNotNull { it.splitPair('=') }.toMap()
	val jar = argumentsPairs["-jar"]?.let {
		when {
			it.startsWith("file:") || it.startsWith("jrt:") || it.startsWith("jar:") -> URI(it).toURL()
			else -> File(it).toURI().toURL()
		}
	}

	classLoader = jar?.let { URLClassLoader(arrayOf(jar), ApplicationEnvironment::class.java.classLoader) }
		?: ApplicationEnvironment::class.java.classLoader
}