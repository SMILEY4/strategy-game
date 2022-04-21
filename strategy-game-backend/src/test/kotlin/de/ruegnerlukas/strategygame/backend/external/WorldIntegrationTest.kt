package de.ruegnerlukas.strategygame.backend.external

import io.kotest.matchers.maps.shouldContainKey
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldStartWith
import io.ktor.client.plugins.websocket.WebSockets
import io.ktor.client.plugins.websocket.webSocket
import io.ktor.client.request.post
import io.ktor.client.statement.bodyAsText
import io.ktor.server.testing.testApplication
import io.ktor.websocket.Frame
import io.ktor.websocket.readText
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import org.junit.jupiter.api.Test

class WorldIntegrationTest {

	@Test
	fun testGameLifecycle() {
		testApplication {
			val client = createClient {
				install(WebSockets)
			}

			// create a game
			val response = client.post("api/world/create")
			val responseBody: Map<String, String> = Json.decodeFromString(response.bodyAsText())
			responseBody shouldContainKey "worldId"
			val worldId = responseBody["worldId"]

			client.webSocket("/api/world/messages") {

				// join world
				send(Frame.Text("""
					{
						"type": "join-world",
						"payload": "{
							\"worldId\": \"$worldId\",
							\"playerName\": \"clientA\"
						}"
					}
				""".trimIndent()))

				// receive world state
				((incoming.receive() as? Frame.Text)?.readText() ?: "")
					.replace(System.lineSeparator(), "")
					.replace(" ", "") shouldStartWith  "{\"type\":\"world-state\",".trimMargin()

				// submit turn
				send(Frame.Text("""
					{
						"type": "submit-turn",
						"payload": "{
							\"worldId\": \"$worldId\",
							\"commands\": [
								{\"q\": 4, \"r\": 2},
								{\"q\": 1, \"r\": 6}
							]
						}"
					}
				""".trimIndent()))

				// receive next turn
				((incoming.receive() as? Frame.Text)?.readText() ?: "")
					.replace(System.lineSeparator(), "")
					.replace(" ", "") shouldBe "{\"type\":\"new-turn\",\"payload\":\"{\\\"addedMarkers\\\":[{\\\"q\\\":4,\\\"r\\\":2,\\\"playerId\\\":0},{\\\"q\\\":1,\\\"r\\\":6,\\\"playerId\\\":0}]}\"}"

			}


		}
	}


}