package de.ruegnerlukas.strategygame.backend.external.api.routing

import de.ruegnerlukas.strategygame.backend.ports.provided.CreateGameLobbyAction
import de.ruegnerlukas.strategygame.backend.ports.provided.JoinGameLobbyAction
import de.ruegnerlukas.strategygame.backend.ports.provided.ListPlayerGameLobbiesAction
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
	createLobby: CreateGameLobbyAction,
	joinLobby: JoinGameLobbyAction,
	listLobbies: ListPlayerGameLobbiesAction,
) {
	authenticate {
		route("game") {
			post("create") {
				val result = createLobby.perform(getUserIdOrThrow(call))
				when {
					result.isSuccess() -> call.respond(HttpStatusCode.OK, result.get())
					result.isError() -> call.respond(HttpStatusCode.InternalServerError, result.getError())
				}
			}
			post("join/{gameId}") {
				val result = joinLobby.perform(getUserIdOrThrow(call), call.parameters["gameId"]!!)
				when {
					result.isSuccess() -> call.respond(HttpStatusCode.OK, "")
					result.isError() -> call.respond(HttpStatusCode.InternalServerError, result.getError())
				}
			}
			get("list") {
				val result = listLobbies.perform(getUserIdOrThrow(call))
				when {
					result.isSuccess() -> call.respond(HttpStatusCode.OK, result.get())
					result.isError() -> call.respond(HttpStatusCode.InternalServerError, result.getError())
				}
			}
		}
	}
}

