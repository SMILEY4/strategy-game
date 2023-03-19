package de.ruegnerlukas.strategygame.backend.core.game

import de.ruegnerlukas.strategygame.backend.testutils.coreTest
import io.kotest.core.spec.style.StringSpec

class GameConnectTest : StringSpec({

	"request to connect to a game as a player, expect success" {
		coreTest {
			val gameId = createAndJoinGame("user")
			requestConnect_expectOk("user", gameId)
		}
	}

	"request to connect to a game without being a player, expect 'NotParticipantError'" {
		coreTest {
			val gameId = createAndJoinGame("user-1")
			requestConnect_expectNotParticipant("user-2", gameId)
		}
	}

	"request to connect to an already connected game, expect 'AlreadyConnectedError'" {
		coreTest {
			val gameId = createAndJoinGame("user")
			connect("user", gameId)
			requestConnect_expectAlreadyConnected("user", gameId)
		}
	}

	"request to connect to a game that does not exist, expect 'GameNotFoundError'" {
		coreTest {
			requestConnect_expectGameNotFound("user", "unknown-game")
		}
	}

})