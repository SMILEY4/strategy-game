package de.ruegnerlukas.strategygame.backend.core.game

import de.ruegnerlukas.strategygame.backend.common.models.Player
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.RequestConnectionToGame
import de.ruegnerlukas.strategygame.backend.testdsl.actions.connectGame
import de.ruegnerlukas.strategygame.backend.testdsl.actions.createGame
import de.ruegnerlukas.strategygame.backend.testdsl.assertions.expectPlayers
import de.ruegnerlukas.strategygame.backend.testdsl.gameTest
import de.ruegnerlukas.strategygame.backend.testdsl.actions.joinGame
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
                    state = Player.STATE_PLAYING
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
                expectedRequestError = RequestConnectionToGame.NotParticipantError
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
                expectedRequestError = RequestConnectionToGame.AlreadyConnectedError
            }
            expectPlayers {
                player {
                    userId = "user"
                    state = Player.STATE_PLAYING
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
                expectedRequestError = RequestConnectionToGame.GameNotFoundError
            }
        }
    }

})