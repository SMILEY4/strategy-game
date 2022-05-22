package de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby

import de.ruegnerlukas.strategygame.backend.shared.Rail

interface GameLobbyConnectAction {

	suspend fun perform(userId: String, connectionId: Int, gameId: String): Rail<Unit>

}