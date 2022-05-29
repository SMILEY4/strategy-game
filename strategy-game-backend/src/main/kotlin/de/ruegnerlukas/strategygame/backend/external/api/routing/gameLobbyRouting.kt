package de.ruegnerlukas.strategygame.backend.external.api.routing

import de.ruegnerlukas.strategygame.backend.ports.errors.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbiesListAction
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbyCreateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbyJoinAction
import de.ruegnerlukas.strategygame.backend.shared.either.respondCallErr
import de.ruegnerlukas.strategygame.backend.shared.either.respondCallOk
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
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
					.respondCallOk(call, HttpStatusCode.OK)
					.respondCallErr(call, HttpStatusCode.InternalServerError)
			}
			post("join/{gameId}") {
				joinLobby.perform(getUserIdOrThrow(call), call.parameters["gameId"]!!)
					.respondCallOk(call, HttpStatusCode.OK)
					.respondCallErr(call, GameNotFoundError, HttpStatusCode.NotFound)
					.respondCallErr(call, HttpStatusCode.InternalServerError)
			}
			get("list") {
				listLobbies.perform(getUserIdOrThrow(call))
					.respondCallOk(call, HttpStatusCode.OK)
					.respondCallErr(call, HttpStatusCode.InternalServerError)
			}
		}
	}
}

