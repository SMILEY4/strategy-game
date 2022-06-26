package de.ruegnerlukas.strategygame.backend.core.actions.game

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameDisconnectAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerUpdateConnectionByUserSetNull
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.flatMap

class GameDisconnectActionImpl(
	private val updatePlayerConnection: PlayerUpdateConnectionByUserSetNull
) : GameDisconnectAction, Logging {

	override suspend fun perform(userId: String): Either<Unit, ApplicationError> {
		log().info("Disconnect user $userId from currently connected game-lobby")
		return Either.start()
			.flatMap { updatePlayerConnection.execute(userId) }
	}

}