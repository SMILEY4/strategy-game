package de.ruegnerlukas.strategygame.backend.external.api.routing

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.world.WorldSettings
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
import java.util.Random


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
				val userId = getUserIdOrThrow(call)
				val gameId = createLobby.perform(WorldSettings.default())
				val joinResult = joinLobby.perform(userId, gameId)
				when (joinResult) {
					is Either.Right -> {
						call.respond(HttpStatusCode.OK, gameId)
					}
					is Either.Left -> when (joinResult.value) {
						GameJoinAction.GameNotFoundError -> call.respond(HttpStatusCode.NotFound, joinResult.value)
						GameJoinAction.UserAlreadyPlayerError -> call.respond(HttpStatusCode.OK, joinResult.value)
					}
				}
			}
			post("join/{gameId}") {
				val result = joinLobby.perform(getUserIdOrThrow(call), call.parameters["gameId"]!!)
				when (result) {
					is Either.Right -> {
						call.respond(HttpStatusCode.OK, result.value)
					}
					is Either.Left -> when (result.value) {
						GameJoinAction.GameNotFoundError -> call.respond(HttpStatusCode.NotFound, result.value)
						GameJoinAction.UserAlreadyPlayerError -> call.respond(HttpStatusCode.OK, result.value)
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
