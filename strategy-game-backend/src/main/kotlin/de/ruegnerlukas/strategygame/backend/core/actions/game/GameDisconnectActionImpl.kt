package de.ruegnerlukas.strategygame.backend.core.actions.game

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameDisconnectAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerUpdateConnectionByUserSetNull
import de.ruegnerlukas.strategygame.backend.shared.Logging

class GameDisconnectActionImpl(
	private val updatePlayerConnection: PlayerUpdateConnectionByUserSetNull
) : GameDisconnectAction, Logging {

	override suspend fun perform(userId: String): Either<ApplicationError, Unit> {
		log().info("Disconnect user $userId from currently connected game-lobby")
		return updatePlayerConnection.execute(userId)
	}

}