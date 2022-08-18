package de.ruegnerlukas.strategygame.backend.external.api.routing

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameCreateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GamesListAction
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.http.content.resolveResource
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route


/**
 * Configuration for game routes
 */
fun Route.gameRoutes(
	createLobby: GameCreateAction,
	joinLobby: GameJoinAction,
	listLobbies: GamesListAction,
	gameConfig: GameConfig
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
						call.respond(HttpStatusCode.OK, Unit)
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
			get("config") {
				call.respond(HttpStatusCode.OK, gameConfig)
			}
		}
	}
}