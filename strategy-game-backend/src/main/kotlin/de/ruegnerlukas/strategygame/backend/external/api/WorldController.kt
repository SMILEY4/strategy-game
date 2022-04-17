package de.ruegnerlukas.strategygame.backend.external.api

import de.ruegnerlukas.strategygame.backend.core.ports.provided.WorldHandler
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import io.ktor.server.routing.route

/**
 * Configuration for all world routes
 */
fun Route.worldRoutes(worldHandler: WorldHandler) {
	route("world") {
		post("create") {
			worldHandler.create()
				.onSuccess { call.respond(HttpStatusCode.OK, it) }
				.onFailure { call.respond(HttpStatusCode.InternalServerError, it.message ?: "") }
		}
	}
}