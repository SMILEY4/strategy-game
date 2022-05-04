package de.ruegnerlukas.strategygame.backend.external.api.routing

import de.ruegnerlukas.strategygame.backend.ports.provided.CreateNewWorldAction
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import io.ktor.server.routing.route

/**
 * configuration for world-actions
 */
fun Route.worldRoutes(createNewWorldAction: CreateNewWorldAction) {
	route("world") {
		post("create") {
			createNewWorldAction.perform()
				.onSuccess { call.respond(HttpStatusCode.OK, it) }
				.onFailure { call.respond(HttpStatusCode.InternalServerError, it.message ?: "") }
		}
	}
}