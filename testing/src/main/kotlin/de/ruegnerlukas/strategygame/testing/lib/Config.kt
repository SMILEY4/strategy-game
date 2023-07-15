package de.ruegnerlukas.strategygame.testing.lib

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import java.io.File

data class Config(
    val testUser: TestUserConfig
) {

    companion object {

        private var config: Config? = null

        fun get(): Config = config!!

        fun load(file: File) {
            config = jacksonObjectMapper().readValue(file)
        }

    }

}

data class TestUserConfig(
    val email: String,
    val password: String
)