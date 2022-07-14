package de.ruegnerlukas.strategygame.backend.external.api.routing

import de.ruegnerlukas.strategygame.backend.ports.errors.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameCreateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GamesListAction
import de.ruegnerlukas.strategygame.backend.shared.respondHttp
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
	createLobby: GameCreateAction,
	joinLobby: GameJoinAction,
	listLobbies: GamesListAction,
) {
	authenticate {
		route("game") {
			post("create") {
				createLobby.perform(getUserIdOrThrow(call))
					.respondHttp(call) {
						anyRight(HttpStatusCode.OK, it)
						anyLeft(HttpStatusCode.InternalServerError)
					}
			}
			post("join/{gameId}") {
				joinLobby.perform(getUserIdOrThrow(call), call.parameters["gameId"]!!)
					.respondHttp(call) {
						anyRight(HttpStatusCode.OK, it)
						left(GameNotFoundError, HttpStatusCode.NotFound)
						anyLeft(HttpStatusCode.InternalServerError)
					}
			}
			get("list") {
				listLobbies.perform(getUserIdOrThrow(call))
					.respondHttp(call) {
						anyRight(HttpStatusCode.OK, it)
						anyLeft(HttpStatusCode.InternalServerError)
					}
			}
		}
	}
}

