package de.ruegnerlukas.strategygame.backend.shared.config

import com.typesafe.config.ConfigFactory
import com.typesafe.config.ConfigRenderOptions
import de.ruegnerlukas.strategygame.backend.APPLICATION_MODE
import de.ruegnerlukas.strategygame.backend.ApplicationMode
import kotlinx.serialization.Serializable
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json

object Config {

	init {
		if (APPLICATION_MODE == ApplicationMode.DEV) {
			load(ApplicationMode.DEV)
		}
	}

	private var baseConfig: com.typesafe.config.Config? = null
	private var configData: ConfigData? = null


	/**
	 * @param envName the name of the environment. Defines, which config file(s) to load in addition to the base file(s) ( application.<env>.conf, application.<env>.local.conf )
	 */
	fun load(envName: String) {
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
		set(json.decodeFromString(jsonConfig), config)
	}


	fun set(data: ConfigData, baseConfig: com.typesafe.config.Config? = null) {
		Config.configData = data
		Config.baseConfig = baseConfig
	}


	fun get(): ConfigData {
		if (configData == null) {
			throw IllegalStateException("No config data set")
		} else {
			return configData!!
		}
	}


	fun getBaseTypesafeConfig() = baseConfig

}


@Serializable
data class ConfigData(
	val identityProvider: String, // either "cognito" or "dummy"
	val aws: AwsConfig
)


@Serializable
data class AwsConfig(
	val region: String,
	val user: AwsUserConfig,
	val cognito: AwsCognitoConfig
)


@Serializable
data class AwsUserConfig(
	val accessKey: String,
	val name: String,
	val secretAccess: String
)


@Serializable
data class AwsCognitoConfig(
	val clientId: String,
	val poolId: String
)