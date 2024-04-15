package de.ruegnerlukas.strategygame.backend.application

import de.ruegnerlukas.strategygame.backend.testutils.integrationTest
import de.ruegnerlukas.strategygame.backend.user.external.api.LoginData
import de.ruegnerlukas.strategygame.backend.user.external.client.DummyUserIdentityService
import de.ruegnerlukas.strategygame.backend.user.ports.models.AuthData
import io.kotest.assertions.ktor.client.shouldHaveStatus
import io.kotest.assertions.withClue
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldHaveMinLength
import io.ktor.client.call.body
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType

class UserAuthTest : StringSpec({

    "login should succeed with valid token" {
        integrationTest { client ->
            val loginResponse = client.post("/api/user/login") {
                contentType(ContentType.Application.Json)
                setBody(LoginData("example@test.com", "pw123"))
            }
            loginResponse shouldHaveStatus HttpStatusCode.OK
            val token = loginResponse.body<AuthData>().idToken
            withClue("token should be valid") {
                token shouldHaveMinLength 6
                DummyUserIdentityService().verifyJwtToken(token) shouldBe true
                DummyUserIdentityService().extractUserId(token) shouldBe "example@test.com"
            }
        }
    }

    "valid user can call protected route" {
        integrationTest { client ->
            val token = client.post("/api/user/login") {
                contentType(ContentType.Application.Json)
                setBody(LoginData("example@test.com", "pw123"))
            }.body<AuthData>().idToken
            val response = client.post("/api/session/create?name=test") {
                header("Authorization", "Bearer  $token")
            }
            response shouldHaveStatus HttpStatusCode.OK
            response.bodyAsText() shouldHaveMinLength 1
        }
    }
    "invalid user can not call protected route" {
        integrationTest { client ->
            val response = client.post("/api/session/create") {
                header("Authorization", "Bearer  invalid-token")
            }
            response shouldHaveStatus HttpStatusCode.Unauthorized
        }
    }

})