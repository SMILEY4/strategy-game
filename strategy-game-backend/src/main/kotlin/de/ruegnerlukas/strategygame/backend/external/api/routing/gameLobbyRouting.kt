package de.ruegnerlukas.strategygame.backend.external.api.routing

import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.CreateGameLobbyAction
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route


/**
 * configuration for world-actions
 */
fun Route.gameLobbyRoutes(createLobby: CreateGameLobbyAction) {
	authenticate {
		route("game") {
			post("create") {
				val result = createLobby.perform(getUserIdOrThrow(call))
				when {
					result.isSuccess() -> call.respond(HttpStatusCode.OK, result.getOrThrow())
					result.isError() -> call.respond(HttpStatusCode.InternalServerError, result.getError())
				}
			}
			post("join") { TODO() }
			post("leave") { TODO() }
			post("start") { TODO() }
			get("list") { TODO() }
		}
	}
}

