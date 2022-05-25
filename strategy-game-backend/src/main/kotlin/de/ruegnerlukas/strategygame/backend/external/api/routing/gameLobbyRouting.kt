package de.ruegnerlukas.strategygame.backend.external.api.routing

import de.ruegnerlukas.strategygame.backend.ports.errors.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbiesListAction
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbyCreateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbyJoinAction
import de.ruegnerlukas.strategygame.backend.shared.get
import de.ruegnerlukas.strategygame.backend.shared.getError
import de.ruegnerlukas.strategygame.backend.shared.onError
import de.ruegnerlukas.strategygame.backend.shared.onSuccess
import de.ruegnerlukas.strategygame.backend.shared.recover
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route


/**
 * Configuration for game routes
 */
fun Route.gameLobbyRoutes(
	createLobby: GameLobbyCreateAction,
	joinLobby: GameLobbyJoinAction,
	listLobbies: GameLobbiesListAction,
) {
	authenticate {
		route("game") {
			post("create") {
				createLobby.perform(getUserIdOrThrow(call))
					.onSuccess { call.respond(HttpStatusCode.OK, it) }
					.onError { call.respond(HttpStatusCode.InternalServerError, it.toString()) }
			}
			post("join/{gameId}") {
				joinLobby.perform(getUserIdOrThrow(call), call.parameters["gameId"]!!)
					.onSuccess { call.respond(HttpStatusCode.OK, "") }
					.recover(GameNotFoundError) { call.respond(HttpStatusCode.NotFound, it.toString()) }
					.onError { call.respond(HttpStatusCode.InternalServerError, it.toString()) }
			}
			get("list") {
				listLobbies.perform(getUserIdOrThrow(call))
					.onSuccess { call.respond(HttpStatusCode.OK, it) }
					.onError { call.respond(HttpStatusCode.InternalServerError, it.toString()) }
			}
		}
	}
}

