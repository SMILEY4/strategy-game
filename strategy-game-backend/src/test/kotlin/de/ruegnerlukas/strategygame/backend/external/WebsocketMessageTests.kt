package de.ruegnerlukas.strategygame.backend.external

import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService
import io.kotest.core.spec.style.StringSpec
import io.ktor.server.auth.jwt.JWTAuthenticationProvider

class WebsocketMessageTests : StringSpec({

//	"handle websocket-message" {
//		val userService = MockUserIdentityService("test-user")
//		val incomingFrame = """
//			{
//				"type": "test-message-type",
//				"payload": "{\"value\":\"Hello World\"}"
//			}
//		""".trimIndent()
//
//		val message = WebsocketUtils.buildMessage(userService, 42, "test-token", "test-game-id", incomingFrame)
//		withClue("created message should be valid") {
//			message.connectionId shouldBe 42
//			message.userId shouldBe "test-user"
//			message.gameId shouldBe "test-game-id"
//			message.type shouldBe "test-message-type"
//			message.payload shouldBe "{\"value\":\"Hello World\"}"
//		}
//	}

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
