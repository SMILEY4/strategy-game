package de.ruegnerlukas.strategygame.backend.config

import de.ruegnerlukas.strategygame.backend.core.service.test.TestService
import de.ruegnerlukas.strategygame.backend.core.service.world.WorldService
import de.ruegnerlukas.strategygame.backend.external.api.apiRoutes
import de.ruegnerlukas.strategygame.backend.external.persistence.TestRepositoryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.WorldRepositoryImpl
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.callloging.CallLogging
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.routing.Routing
import io.ktor.server.websocket.WebSockets
import kotlinx.serialization.json.Json
import org.slf4j.event.Level

/**
 * The main-module for configuring Ktor. Referenced in "application.conf".
 */
fun Application.module() {
	install(Routing)
	install(WebSockets)
	install(CallLogging) {
		level = Level.INFO
	}
	install(ContentNegotiation) {
		json(Json {
			prettyPrint = true
		})
	}

	val testHandler = TestService(TestRepositoryImpl())
	val worldHandler = WorldService(WorldRepositoryImpl())

	apiRoutes(testHandler, worldHandler)
}