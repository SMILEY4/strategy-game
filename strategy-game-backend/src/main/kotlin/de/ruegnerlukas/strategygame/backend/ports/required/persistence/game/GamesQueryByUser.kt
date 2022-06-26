package de.ruegnerlukas.strategygame.backend.ports.required.persistence.game

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.shared.either.Either

interface GamesQueryByUser {

	/**
	 * Find the games with the given userid as a player
	 */
	suspend fun execute(userId: String): Either<List<GameEntity>, ApplicationError>

}