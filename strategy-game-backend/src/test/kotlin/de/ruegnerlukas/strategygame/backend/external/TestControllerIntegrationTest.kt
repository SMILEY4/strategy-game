package de.ruegnerlukas.strategygame.backend.external

import io.kotest.assertions.asClue
import io.kotest.matchers.shouldBe
import io.ktor.client.plugins.websocket.WebSockets
import io.ktor.client.plugins.websocket.webSocket
import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText
import io.ktor.http.HttpStatusCode
import io.ktor.server.testing.testApplication
import io.ktor.websocket.Frame
import io.ktor.websocket.readText
import kotlin.test.Test


class TestControllerIntegrationTest {

	@Test
	fun testHello() {
		testApplication {
			val response = client.get("/api/test/hello/John")
			response.asClue {
				it.status shouldBe HttpStatusCode.OK
				it.bodyAsText() shouldBe "Hello John!"
			}
		}
	}



	@Test
	fun testEchoWebsocket() {
		testApplication {
			val client = createClient {
				install(WebSockets)
			}
			client.webSocket("/api/test/echo") {
				val greetingText = (incoming.receive() as? Frame.Text)?.readText() ?: ""
				greetingText shouldBe "Please enter your name"

				listOf("John", "World", "Test").forEach {
					send(Frame.Text(it))
					val response = (incoming.receive() as? Frame.Text)?.readText() ?: ""
					response shouldBe "Hi, $it"
				}

				send(Frame.Text("Bye"))
			}
		}
	}


}