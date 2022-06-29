package de.ruegnerlukas.strategygame.backend.external

import com.fasterxml.jackson.annotation.JsonProperty
import de.ruegnerlukas.strategygame.backend.external.api.message.handler.Message
import de.ruegnerlukas.strategygame.backend.external.api.message.handler.OtherMessage
import de.ruegnerlukas.strategygame.backend.external.api.message.handler.OtherMessagePayload
import de.ruegnerlukas.strategygame.backend.external.api.message.handler.TestMessage
import de.ruegnerlukas.strategygame.backend.external.api.message.handler.TestMessagePayload
import de.ruegnerlukas.strategygame.backend.external.api.websocket.WebsocketUtils
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService
import de.ruegnerlukas.strategygame.backend.shared.Json
import io.kotest.assertions.withClue
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.ktor.server.auth.jwt.JWTAuthenticationProvider

class WebsocketMessageTests : StringSpec({

	"handle websocket-message" {
		val userService = MockUserIdentityService("test-user")
		val incomingFrame = """
			{
				"type": "test-message-type",
				"payload": "{\"value\":\"Hello World\"}"
			}
		""".trimIndent()

		val message = WebsocketUtils.buildMessage(userService, 42, "test-token", "test-game-id", incomingFrame)
		withClue("created message should be valid") {
			message.connectionId shouldBe 42
			message.userId shouldBe "test-user"
			message.gameId shouldBe "test-game-id"
			message.type shouldBe "test-message-type"
			message.payload shouldBe "{\"value\":\"Hello World\"}"
		}
	}

	"(de-)serialize messages" {
		val testMessage = TestMessage(TestMessagePayload("Hello"))
		val otherMessage = OtherMessage(OtherMessagePayload("42"))

		val strTest = Json.asString(testMessage)
		println("json-test: $strTest")

		val strOther = Json.asString(otherMessage)
		println("json-other: $strOther")


		val mapTest = Json.fromStringToMap(strTest)
		println("deserialized test: $mapTest")

		val mapOther = Json.fromStringToMap(strOther)
		println("deserialized other: $mapOther")


		val deTest = Json.fromString<TestMessage>(strTest)
		println("deserialized test: $deTest ${Json.asString(deTest)}")

		val deOther = Json.fromString<OtherMessage>(strOther)
		println("deserialized other: $deOther ${Json.asString(deOther)}")


		val genDeTest = Json.fromString<Message<*>>(strTest) as TestMessage
		println("deserialized generic test: ${genDeTest.payload} ${Json.asString(genDeTest)}")

		val genDeOther = Json.fromString<Message<*>>(strOther) as OtherMessage
		println("deserialized generic other: ${genDeOther.payload} ${Json.asString(genDeOther)}")

	}

})



internal class MockUserIdentityService(private val userId: String) : UserIdentityService {

	override fun extractUserId(jwtToken: String) = userId

	override fun configureAuthentication(config: JWTAuthenticationProvider.Config) = throw UnsupportedOperationException()

	override fun verifyJwtToken(token: String) = throw UnsupportedOperationException()

	override fun createUser(email: String, password: String, username: String) = throw UnsupportedOperationException()

	override fun authenticate(email: String, password: String) = throw UnsupportedOperationException()

	override fun refreshAuthentication(refreshToken: String) = throw UnsupportedOperationException()

	override suspend fun deleteUser(email: String, password: String) = throw UnsupportedOperationException()

}
