package de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby

import de.ruegnerlukas.strategygame.backend.shared.Rail

interface GameLobbyDisconnectAction {

	suspend fun perform(userId: String): Rail<Unit>

}