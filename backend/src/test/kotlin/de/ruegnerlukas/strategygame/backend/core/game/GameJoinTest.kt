package de.ruegnerlukas.strategygame.backend.core.game

import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Player
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.PlayerState
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.JoinGame
import de.ruegnerlukas.strategygame.backend.testdsl.actions.createGame
import de.ruegnerlukas.strategygame.backend.testdsl.assertions.expectPlayers
import de.ruegnerlukas.strategygame.backend.testdsl.gameTest
import de.ruegnerlukas.strategygame.backend.testdsl.actions.joinGame
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