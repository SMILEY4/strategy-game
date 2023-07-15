package de.ruegnerlukas.strategygame.testing.tests

import de.ruegnerlukas.strategygame.testing.lib.Config
import de.ruegnerlukas.strategygame.testing.lib.build.TestGroup
import de.ruegnerlukas.strategygame.testing.lib.tools.models.LoginResponseData
import io.kotest.assertions.ktor.client.shouldHaveStatus
import io.kotest.matchers.string.shouldNotBeBlank
import io.ktor.client.call.body
import io.ktor.http.HttpStatusCode

class UserTest : TestGroup({

    "login with wrong password" {
        user.login(
            email = "wrong-email",
            password = "wrong-password"
        ).also { response ->
            response shouldHaveStatus HttpStatusCode.Unauthorized
        }
    }

    "login with correct password" {
        user.login(
            email = Config.get().testUser.email,
            password = Config.get().testUser.password
        ).also { response ->
            response shouldHaveStatus HttpStatusCode.OK
            response.body<LoginResponseData>().also { data ->
                data.idToken.shouldNotBeBlank()
                data.refreshToken.shouldNotBeBlank()
            }
        }
    }

})