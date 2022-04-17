package de.ruegnerlukas.strategygame.backend.external.api

import de.ruegnerlukas.strategygame.backend.core.ports.provided.TestHandler
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.response.respondRedirect
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import io.ktor.server.routing.routing

/**
 * Main configuration for all routes
 */
fun Application.apiRoutes(testHandler: TestHandler) {
	routing {
		get("/") {
			call.respondRedirect("/api/test/hello/World", true)
		}
		route("api") {
			testRoutes(testHandler)
		}
	}
}