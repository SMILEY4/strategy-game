package de.ruegnerlukas.strategygame.backend.external.api

import de.ruegnerlukas.strategygame.backend.core.ports.provided.TestService
import de.ruegnerlukas.strategygame.backend.core.ports.provided.WorldService
import de.ruegnerlukas.strategygame.backend.external.api.websocket.ConnectionHandler
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.response.respondRedirect
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import io.ktor.server.routing.routing

/**
 * Main configuration for all routes
 */
fun Application.apiRoutes(
	connectionHandler: ConnectionHandler,
	testService: TestService,
	worldService: WorldService,
	worldMessageDispatcher: WorldMessageDispatcher
) {
	routing {
		get("/") {
			call.respondRedirect("/api/test/hello/World", true)
		}
		route("api") {
			routingTest(testService)
			routingWorld(connectionHandler, worldService, worldMessageDispatcher)
		}
	}
}