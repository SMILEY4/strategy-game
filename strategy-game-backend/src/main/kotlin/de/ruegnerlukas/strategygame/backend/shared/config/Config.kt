package de.ruegnerlukas.strategygame.backend.shared.config

import kotlinx.serialization.Serializable

object Config {

	private var configData: ConfigData? = null

	fun set(data: ConfigData) {
		configData = data
	}

	fun get(): ConfigData {
		if (configData == null) {
			throw IllegalStateException("No config data set")
		} else {
			return configData!!
		}
	}

}


@Serializable
data class ConfigData(
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