package de.ruegnerlukas.strategygame.backend.core.actions.game

import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameDisconnectAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerUpdateConnectionByUserSetNull
import de.ruegnerlukas.strategygame.backend.shared.Logging

class GameDisconnectActionImpl(
	private val updatePlayerConnection: PlayerUpdateConnectionByUserSetNull
) : GameDisconnectAction, Logging {

	override suspend fun perform(userId: String) {
		log().info("Disconnect user $userId from all currently connected games")
		updatePlayerConnection.execute(userId)
	}

}