package io.github.smiley4.strategygame.backend.common

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.typesafe.config.ConfigFactory
import com.typesafe.config.ConfigRenderOptions
import io.github.smiley4.strategygame.backend.common.utils.Json

object Config {

    private var baseConfig: com.typesafe.config.Config? = null
    private var configData: ConfigData? = null


    /**
     * @param envName the name of the environment. Defines, which config file(s) to load in addition to the base file(s) ( application.<env>.conf )
     */
    fun load(envName: String) {
        val baseConfig = ConfigFactory.parseResources("application.conf")
        val envConfig = ConfigFactory.parseResources("application.$envName.conf")

        val typesafeConfig = ConfigFactory.load()
            .withFallback(baseConfig)
            .withFallback(envConfig)
            .resolve()

        val jsonConfig = typesafeConfig.root().render(
            ConfigRenderOptions
                .defaults()
                .setShowEnvVariableValues(true)
                .setOriginComments(false)
                .setComments(false)
                .setFormatted(true)
        )

        set(Json.fromString(jsonConfig), typesafeConfig)
    }


    /**
     * Set/update the config-data
     */
    fun set(data: ConfigData, baseConfig: com.typesafe.config.Config? = null) {
        configData = data
        Config.baseConfig = baseConfig
    }


    /**
     * @return the config-data (throws an exception if no data is loaded)
     */
    fun get(): ConfigData {
        if (configData == null) {
            throw IllegalStateException("No config data set")
        } else {
            return configData!!
        }
    }

    /**
     * @return the base [com.typesafe.config.Config] or null
     */
    fun getBaseTypesafeConfig() = baseConfig

}


@JsonIgnoreProperties(ignoreUnknown = true)
data class ConfigData(
    val admin: AdminConfig,
    val database: DatabaseConfig,
    val identityService: UserIdentityServiceConfig,
)


data class AdminConfig(
    val username: String,
    val password: String
)


data class DatabaseConfig(
    val host: String,
    val port: Int,
    val name: String,
    val retryTimeout: Int,
    val retryCount: Int
)

data class UserIdentityServiceConfig(
    val identityProvider: UserIdentityProvider,
    val aws: AwsCognitoConfig?
)

enum class UserIdentityProvider {
    DUMMY, AWS_COGNITO
}

data class AwsCognitoConfig(
    val clientId: String,
    val poolId: String,
    val accessKeyId: String,
    val secretAccessKey: String,
    val region: String
)