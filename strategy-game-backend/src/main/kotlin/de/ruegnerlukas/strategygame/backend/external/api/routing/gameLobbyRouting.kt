package de.ruegnerlukas.strategygame.backend.external.api.routing

import arrow.core.Either
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
				val gameId = createLobby.perform(getUserIdOrThrow(call))
				call.respond(HttpStatusCode.OK, gameId)
			}
			post("join/{gameId}") {
				val result = joinLobby.perform(getUserIdOrThrow(call), call.parameters["gameId"]!!)
				when (result) {
					is Either.Right -> {
						call.respond(HttpStatusCode.OK, result.value)
					}
					is Either.Left -> when (result.value) {
						GameJoinAction.GameNotFoundError -> call.respond(HttpStatusCode.NotFound, result.value)
						GameJoinAction.UserAlreadyPlayer -> call.respond(HttpStatusCode.OK, result.value)
					}
				}
			}
			get("list") {
				val gameIds = listLobbies.perform(getUserIdOrThrow(call))
				call.respond(HttpStatusCode.OK, gameIds)
			}
		}
	}
}
