package de.ruegnerlukas.strategygame.backend.ports.required.persistence.player

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.shared.either.Either

interface PlayerQueryByUserAndGame {

	/**
	 * Find the player by the given userid and game
	 */
	suspend fun execute(userId: String, gameId: String): Either<PlayerEntity, ApplicationError>

}