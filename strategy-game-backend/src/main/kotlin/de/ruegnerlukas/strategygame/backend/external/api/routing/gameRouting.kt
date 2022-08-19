package de.ruegnerlukas.strategygame.backend.external.api.routing

import arrow.core.Either
import de.lruegner.ktorswaggerui.ParameterDocumentation
import de.lruegner.ktorswaggerui.documentation.get
import de.lruegner.ktorswaggerui.documentation.post
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameCreateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GamesListAction
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
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
            post("create", {
                description = "Create a new game. Other players can join this game via the returned game-id"
                response(HttpStatusCode.OK, "Successfully created a new game")
            }) {
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
            post("join/{gameId}", {
                description = "Join a game as a participant."
                response(HttpStatusCode.OK, "Successfully joined the game")
                response(HttpStatusCode.NotFound, "The game with the given id was not found")
                pathParam("gameId") {
                    description = "the id of the game to join"
                    dataType = ParameterDocumentation.Companion.ParameterDataType.STRING
                }
            }) {
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
            get("list", {
                description = "List all games with the user as a participant.."
                response(HttpStatusCode.OK, "Request successful")
            }) {
                val gameIds = listLobbies.perform(getUserIdOrThrow(call))
                call.respond(HttpStatusCode.OK, gameIds)
            }
            get("config", {
                description = "Fetch the configuration and values for games"
                response(HttpStatusCode.OK, "Request successful", GameConfig::class.java)
            }) {
                call.respond(HttpStatusCode.OK, gameConfig)
            }
        }
    }
}
