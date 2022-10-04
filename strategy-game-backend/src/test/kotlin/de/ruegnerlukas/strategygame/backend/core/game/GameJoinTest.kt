package de.ruegnerlukas.strategygame.backend.core.game

import de.ruegnerlukas.strategygame.backend.testutils.coreTest
import de.ruegnerlukas.strategygame.backend.testutils.coreTestWithGame
import io.kotest.core.spec.style.StringSpec

class GameJoinTest : StringSpec({

    "create and join a new game, expect success and new game with one player" {
        coreTestWithGame { gameId ->
            joinGame("user", gameId)
            expectPlayers(gameId, listOf("user"))
        }
    }

    "joining a game, expect success and game with two players" {
        coreTestWithGame { gameId ->
            joinGame("user-1", gameId)
            joinGame("user-2", gameId)
            expectPlayers(gameId, listOf("user-1", "user-2"))
        }
    }

    "join a game as a player in that game already, expect no change" {
        coreTestWithGame { gameId ->
            joinGame("user-1", gameId)
            joinGame("user-2", gameId)
            expectPlayers(gameId, listOf("user-1", "user-2"))
            joinGame_expectAlreadyPlayer("user-2", gameId)
            expectPlayers(gameId, listOf("user-1", "user-2"))
        }
    }

    "join a game that does not exist, expect 'GameNotFoundError'" {
        coreTest {
            joinGame_expectGameNotFound("user", "unknown-game")
        }
    }

})