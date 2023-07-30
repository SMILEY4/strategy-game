package de.ruegnerlukas.strategygame.backend.app

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.typesafe.config.ConfigFactory
import com.typesafe.config.ConfigRenderOptions
import de.ruegnerlukas.strategygame.backend.APPLICATION_MODE
import de.ruegnerlukas.strategygame.backend.ApplicationMode
import de.ruegnerlukas.strategygame.backend.common.utils.Json

object Config {

    init {
        // reload config in dev mode (to make it work with hot-reload)
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

        val typesafeConfig = ConfigFactory.load()
            .withFallback(envLocalConfig)
            .withFallback(envConfig)
            .withFallback(baseLocalConfig)
            .withFallback(baseConfig)

        val jsonConfig = typesafeConfig.root().render(
            ConfigRenderOptions
                .defaults()
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
    val aws: AwsConfig,
    val identityProvider: String = "cognito", // either "cognito" or "dummy"
)

data class AdminConfig(
    val username: String,
    val password: String
)

data class AwsConfig(
    val region: String,
    val user: AwsUserConfig,
    val cognito: AwsCognitoConfig
)

data class AwsUserConfig(
    val name: String,
    val accessKeyId: String,
    val secretAccessKey: String
)

data class AwsCognitoConfig(
    val clientId: String,
    val poolId: String
)

data class DatabaseConfig(
    val host: String,
    val port: Int,
    val name: String,
    val retryTimeout: Int,
    val retryCount: Int
)