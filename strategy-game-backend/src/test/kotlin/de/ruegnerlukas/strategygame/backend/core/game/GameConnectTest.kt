package de.ruegnerlukas.strategygame.backend.core.game

import de.ruegnerlukas.strategygame.backend.ports.models.entities.Player
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameRequestConnectionAction
import de.ruegnerlukas.strategygame.backend.testutils.gameTest
import io.kotest.core.spec.style.StringSpec

class GameConnectTest : StringSpec({

    "request to connect to a game as a player, expect success" {
        gameTest {
            createGame { }
            joinGame("user")
            connectGame {
                userId = "user"
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
            createGame { }
            connectGame {
                userId = "user"
                connectionId = 0
                expectedRequestError = GameRequestConnectionAction.NotParticipantError
            }
            expectNoMarkers()
        }
    }

    "request to connect to an already connected game, expect 'AlreadyConnectedError'" {
        gameTest {
            createGame { }
            joinGame("user")
            connectGame {
                userId = "user"
                connectionId = 0
            }
            connectGame {
                userId = "user"
                connectionId = 1
                expectedRequestError = GameRequestConnectionAction.AlreadyConnectedError
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
            createGame { }
            connectGame {
                gameId = "unknown-game-id"
                userId = "user"
                connectionId = 0
                expectedRequestError = GameRequestConnectionAction.GameNotFoundError
            }
        }
    }

})