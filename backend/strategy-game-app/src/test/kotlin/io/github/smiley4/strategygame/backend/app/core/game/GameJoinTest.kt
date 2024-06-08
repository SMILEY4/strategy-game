package io.github.smiley4.strategygame.backend.app.core.game

import io.github.smiley4.strategygame.backend.app.testdsl.actions.createGame
import io.github.smiley4.strategygame.backend.app.testdsl.actions.joinGame
import io.github.smiley4.strategygame.backend.app.testdsl.assertions.expectPlayers
import io.github.smiley4.strategygame.backend.app.testdsl.gameTest
import io.github.smiley4.strategygame.backend.common.models.PlayerState
import io.github.smiley4.strategygame.backend.worlds.ports.provided.JoinGame
import io.kotest.core.spec.style.StringSpec

class GameJoinTest : StringSpec({

    "create and join a new game, expect success and new game with one player" {
        gameTest {
            createGame()
            joinGame("user")
            expectPlayers {
                player {
                    userId = "user"
                    state = PlayerState.PLAYING
                    connectionId = null
                }
            }
        }
    }

    "joining a game, expect success and game with two players" {
        gameTest {
            createGame()
            joinGame("user-1")
            joinGame("user-2")
            expectPlayers {
                player {
                    userId = "user-1"
                    state = PlayerState.PLAYING
                    connectionId = null
                }
                player {
                    userId = "user-2"
                    state = PlayerState.PLAYING
                    connectionId = null
                }
            }
        }
    }

    "join a game as a player in that game already, expect no change" {
        gameTest {
            createGame { }
            joinGame("user-1")
            joinGame("user-2")
            joinGame("user-1") {
                expectedError = JoinGame.UserAlreadyJoinedError()
            }
            expectPlayers {
                player {
                    userId = "user-1"
                    state = PlayerState.PLAYING
                    connectionId = null
                }
                player {
                    userId = "user-2"
                    state = PlayerState.PLAYING
                    connectionId = null
                }
            }
        }
    }

    "join a game that does not exist, expect 'GameNotFoundError'" {
        gameTest {
            createGame { }
            joinGame("user") {
                gameId = "unknown-game-id"
                expectedError = JoinGame.GameNotFoundError()
            }
        }
    }

})