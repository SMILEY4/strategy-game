package de.ruegnerlukas.strategygame.backend.core.actions.game

import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameDisconnectAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.UpdatePlayerConnectionsSetNull
import de.ruegnerlukas.strategygame.backend.shared.Logging

class GameDisconnectActionImpl(
	private val updatePlayerConnectionsSetNull: UpdatePlayerConnectionsSetNull
) : GameDisconnectAction, Logging {

	override suspend fun perform(userId: String) {
		log().info("Disconnect user $userId from all currently connected games")
		clearConnections(userId)
	}


	/**
	 * Set all connections of the given user to "null"
	 */
	private suspend fun clearConnections(userId: String) {
		updatePlayerConnectionsSetNull.execute(userId)
	}

}