package io.github.smiley4.strategygame.backend.app.core.game

import io.github.smiley4.strategygame.backend.app.testdsl.actions.connectGame
import io.github.smiley4.strategygame.backend.app.testdsl.actions.createGame
import io.github.smiley4.strategygame.backend.app.testdsl.actions.joinGame
import io.github.smiley4.strategygame.backend.app.testdsl.assertions.expectPlayers
import io.github.smiley4.strategygame.backend.app.testdsl.gameTest
import io.github.smiley4.strategygame.backend.common.models.PlayerState
import io.github.smiley4.strategygame.backend.worlds.module.core.provided.RequestConnectionToGame
import io.kotest.core.spec.style.StringSpec

class GameConnectTest : StringSpec({

    "request to connect to a game as a player, expect success" {
        gameTest {
            createGame()
            joinGame("user")
            connectGame("user") {
                connectionId = 0
            }
            expectPlayers {
                player {
                    userId = "user"
                    state = PlayerState.PLAYING
                    connectionId = 0
                }
            }
        }
    }

    "request to connect to a game without being a player, expect 'NotParticipantError'" {
        gameTest {
            createGame()
            connectGame("user") {
                connectionId = 0
                expectedRequestError = RequestConnectionToGame.NotParticipantError()
            }
        }
    }

    "request to connect to an already connected game, expect 'AlreadyConnectedError'" {
        gameTest {
            createGame()
            joinGame("user")
            connectGame("user") {
                connectionId = 0
            }
            connectGame("user") {
                connectionId = 1
                expectedRequestError = RequestConnectionToGame.AlreadyConnectedError()
            }
            expectPlayers {
                player {
                    userId = "user"
                    state = PlayerState.PLAYING
                    connectionId = 0
                }
            }
        }
    }

    "request to connect to a game that does not exist, expect 'GameNotFoundError'" {
        gameTest {
            createGame()
            connectGame("user") {
                gameId = "unknown-game-id"
                connectionId = 0
                expectedRequestError = RequestConnectionToGame.GameNotFoundError()
            }
        }
    }

})