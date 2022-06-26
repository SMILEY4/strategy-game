package de.ruegnerlukas.strategygame.backend.testutils

import com.fasterxml.jackson.core.util.DefaultIndenter
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter
import com.fasterxml.jackson.databind.SerializationFeature
import com.typesafe.config.ConfigFactory
import com.typesafe.config.ConfigRenderOptions
import de.ruegnerlukas.strategygame.backend.shared.Config
import de.ruegnerlukas.strategygame.backend.shared.Json
import io.ktor.client.HttpClient
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.websocket.WebSockets
import io.ktor.serialization.jackson.*
import io.ktor.server.testing.ApplicationTestBuilder
import io.ktor.server.testing.testApplication


fun integrationTest(block: suspend ApplicationTestBuilder.(client: HttpClient) -> Unit) {
	testApplication {
		loadApplicationConfig()
		val client = createClient {
			install(WebSockets)
			install(ContentNegotiation) {
				jackson {
					configure(SerializationFeature.INDENT_OUTPUT, true)
					setDefaultPrettyPrinter(DefaultPrettyPrinter().apply {
						indentArraysWith(DefaultPrettyPrinter.FixedSpaceIndenter.instance)
						indentObjectsWith(DefaultIndenter("  ", "\n"))
					})
				}
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
	Config.set(Json.fromString(jsonConfig))
}
