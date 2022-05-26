package de.ruegnerlukas.strategygame.backend.integration

import de.ruegnerlukas.strategygame.backend.ports.models.auth.LoginData
import de.ruegnerlukas.strategygame.backend.external.users.DummyUserIdentityService
import de.ruegnerlukas.strategygame.backend.ports.models.auth.AuthData
import io.kotest.assertions.ktor.client.shouldHaveStatus
import io.kotest.assertions.withClue
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
import org.junit.jupiter.api.Test

class UserAuthTest {

	@Test
	fun loginShouldSucceedWithValidToken() = integrationTest { client ->

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


	@Test
	fun validUserCanCallProtectedRoute() = integrationTest { client ->

		val token = client.post("/api/user/login") {
			contentType(ContentType.Application.Json)
			setBody(LoginData("example@test.com", "pw123"))
		}.body<AuthData>().idToken

		val response = client.post("/api/game/create") {
			header("Authorization", "Bearer  $token")
		}

		response shouldHaveStatus HttpStatusCode.OK
		response.bodyAsText() shouldHaveMinLength 1
	}

	@Test
	fun invalidUserCantCallProtectedRoute() = integrationTest { client ->
		val response = client.post("/api/game/create") {
			header("Authorization", "Bearer  invalid-token")
		}
		response shouldHaveStatus HttpStatusCode.Unauthorized
	}


}