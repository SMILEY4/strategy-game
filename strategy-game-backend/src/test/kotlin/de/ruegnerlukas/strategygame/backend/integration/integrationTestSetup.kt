package de.ruegnerlukas.strategygame.backend.integration

import com.typesafe.config.ConfigFactory
import com.typesafe.config.ConfigRenderOptions
import io.ktor.client.HttpClient
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.websocket.WebSockets
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.testing.ApplicationTestBuilder
import io.ktor.server.testing.testApplication
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json


fun integrationTest(block: suspend ApplicationTestBuilder.(client: HttpClient) -> Unit) {
	testApplication {
		loadApplicationConfig()
		val client = createClient {
			install(WebSockets)
			install(ContentNegotiation) {
				json(Json {
					prettyPrint = true
				})
			}
		}
		block(this, client)
	}
}

fun loadApplicationConfig() {
	val config = ConfigFactory.load()
		.withFallback(ConfigFactory.parseResources("application.conf"))
	val jsonConfig = config.root().render(
		ConfigRenderOptions
			.defaults()
			.setOriginComments(false)
			.setComments(false)
			.setFormatted(true)
	)
	val json = Json { ignoreUnknownKeys = true }
	de.ruegnerlukas.strategygame.backend.shared.config.Config.set(json.decodeFromString(jsonConfig))
}


fun ApplicationTestBuilder.createTestClient(): HttpClient {
	return createClient {
		install(WebSockets)
	}
}

