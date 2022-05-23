package de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby

import de.ruegnerlukas.strategygame.backend.shared.Rail

interface GameLobbyJoinAction {

	suspend fun perform(userId: String, gameId: String): Rail<Unit>

}