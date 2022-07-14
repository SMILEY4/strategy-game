package de.ruegnerlukas.strategygame.backend.external.api.routing

import de.ruegnerlukas.strategygame.backend.ports.errors.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameCreateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GamesListAction
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
	createLobby: GameCreateAction,
	joinLobby: GameJoinAction,
	listLobbies: GamesListAction,
) {
	authenticate {
		route("game") {
			post("create") {
				createLobby.perform(getUserIdOrThrow(call))
					.fold(
						{ call.respond(HttpStatusCode.InternalServerError, it.toString()) },
						{ call.respond(HttpStatusCode.OK, it) }
					)
			}
			post("join/{gameId}") {
				joinLobby.perform(getUserIdOrThrow(call), call.parameters["gameId"]!!)
					.fold(
						{ e ->
							when (e) {
								is GameNotFoundError -> call.respond(HttpStatusCode.NotFound, it)
								else -> call.respond(HttpStatusCode.InternalServerError, it.toString())
							}
						},
						{ call.respond(HttpStatusCode.OK, it) }
					)
			}
			get("list") {
				listLobbies.perform(getUserIdOrThrow(call))
					.fold(
						{ call.respond(HttpStatusCode.InternalServerError, it.toString()) },
						{ call.respond(HttpStatusCode.OK, it) }
					)
			}
		}
	}
}

