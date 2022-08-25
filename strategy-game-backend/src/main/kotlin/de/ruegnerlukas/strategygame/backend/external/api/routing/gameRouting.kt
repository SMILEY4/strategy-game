package de.ruegnerlukas.strategygame.backend.external.api.routing

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameCreateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GamesListAction
import de.ruegnerlukas.strategygame.backend.shared.traceId
import io.github.smiley4.ktorswaggerui.documentation.get
import io.github.smiley4.ktorswaggerui.documentation.post
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.route
import mu.withLoggingContext


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
                description = "Create and join a new game. Other players can join this game via the returned game-id"
                response {
                    HttpStatusCode.OK to {
                        description = "Successfully created a new game"
                        body(String::class) {
                            description = "the id of the created game"
                        }
                    }
                    HttpStatusCode.Conflict to {
                        description = "Error during creation of new game."
                        body(ApiResponse::class) {
                            example("GameNotFoundError", ApiResponse.failure(GameJoinAction.GameNotFoundError)) {
                                description = "Game could not be found when trying to join it."
                            }
                            example("UserAlreadyPlayerError", ApiResponse.failure(GameJoinAction.UserAlreadyPlayerError)) {
                                description = "The user has already joined the game."
                            }
                        }
                    }
                }
            }) {
                withLoggingContext(traceId()) {
                    val userId = getUserIdOrThrow(call)
                    val gameId = createLobby.perform(WorldSettings.default())
                    when (val joinResult = joinLobby.perform(userId, gameId)) {
                        is Either.Right -> ApiResponse.respondSuccess(call, gameId)
                        is Either.Left -> when (joinResult.value) {
                            GameJoinAction.GameNotFoundError -> ApiResponse.respondFailure(call, joinResult.value)
                            GameJoinAction.UserAlreadyPlayerError -> ApiResponse.respondFailure(call, joinResult.value)
                        }
                    }
                }
            }
            post("join/{gameId}", {
                description = "Join a game as a participant."
                request {
                    pathParameter("gameId", String::class) {
                        description = "the id of the game to join"
                    }
                }
                response {
                    HttpStatusCode.OK to {
                        description = "Successfully joined the game"
                    }
                    HttpStatusCode.Conflict to {
                        description = "Error when joining the game."
                        body(ApiResponse::class) {
                            example("GameNotFoundError", ApiResponse.failure(GameJoinAction.GameNotFoundError)) {
                                description = "game with given id could not be found."
                            }
                            example("UserAlreadyPlayerError", ApiResponse.failure(GameJoinAction.UserAlreadyPlayerError)) {
                                description = "The user has already joined the game."
                            }
                        }
                    }
                }
            }) {
                withLoggingContext(traceId()) {
                    when (val result = joinLobby.perform(getUserIdOrThrow(call), call.parameters["gameId"]!!)) {
                        is Either.Right -> ApiResponse.respondSuccess(call)
                        is Either.Left -> when (result.value) {
                            GameJoinAction.GameNotFoundError -> ApiResponse.respondFailure(call, result.value)
                            GameJoinAction.UserAlreadyPlayerError -> ApiResponse.respondFailure(call, result.value)
                        }
                    }
                }
            }
            get("list", {
                description = "List all games with the user as a participant."
                response {
                    HttpStatusCode.OK to {
                        description = "Successfully listed all games of the user"
                        body(Array<String>::class) {
                            description = "the list of ids of games the user has joined."
                        }
                    }
                }
            }) {
                withLoggingContext(traceId()) {
                    val gameIds = listLobbies.perform(getUserIdOrThrow(call))
                    ApiResponse.respondSuccess(call, gameIds)
                }
            }
            get("config", {
                description = "Fetch the configuration and values for games."
                response {
                    HttpStatusCode.OK to {
                        description = "Request for config was successful."
                        body(GameConfig::class) {
                            description = "the configuration and values for all games."
                        }
                    }
                }
            }) {
                withLoggingContext(traceId()) {
                    ApiResponse.respondSuccess(call, gameConfig)
                }
            }
        }
    }
}
