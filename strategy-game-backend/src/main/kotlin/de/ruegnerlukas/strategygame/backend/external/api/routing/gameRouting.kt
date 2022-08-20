package de.ruegnerlukas.strategygame.backend.external.api.routing

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameCreateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GamesListAction
import io.github.smiley4.ktorswaggerui.apispec.ParameterDocumentation
import io.github.smiley4.ktorswaggerui.documentation.RouteParameter
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.route
import io.github.smiley4.ktorswaggerui.documentation.post
import io.github.smiley4.ktorswaggerui.documentation.get


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
                response(HttpStatusCode.OK) { description = "Successfully created a new game" }
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
                response(HttpStatusCode.OK) { description = "Successfully joined the game"}
                response(HttpStatusCode.NotFound) { description =  "The game with the given id was not found"}
                pathParameter {
                    name = "gameId"
                    description = "the id of the game to join"
                    schema(RouteParameter.Type.STRING)
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
                response(HttpStatusCode.OK) { description = "Request successful"}
            }) {
                val gameIds = listLobbies.perform(getUserIdOrThrow(call))
                call.respond(HttpStatusCode.OK, gameIds)
            }
            get("config", {
                description = "Fetch the configuration and values for games"
                response(HttpStatusCode.OK) {
                    description = "Request successful"
                    typedBody(GameConfig::class.java) {}
                }
            }) {
                call.respond(HttpStatusCode.OK, gameConfig)
            }
        }
    }
}
