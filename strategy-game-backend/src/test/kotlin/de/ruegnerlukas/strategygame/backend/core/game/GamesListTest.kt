package de.ruegnerlukas.strategygame.backend.core.game

import de.ruegnerlukas.strategygame.backend.testutils.coreTest
import io.kotest.core.spec.style.StringSpec

class GamesListTest : StringSpec({

	"list games of a user that is not a player in any game, expect success and empty list" {
		coreTest {
			listGames_expect("user", listOf())
		}
	}

	"list games of a user that is player, expect success and list of game-ids" {
		coreTest {
			val gameId1 = createAndJoinGame("user-1")
			val gameId2 = createAndJoinGame("user-2")
			val gameId3 = createAndJoinGame("user-3")
			joinGame("user-1", gameId2)
			joinGame("user-1", gameId3)
			listGames_expect("user-1", listOf(gameId1, gameId2, gameId3))
		}
	}

})