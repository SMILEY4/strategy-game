package de.ruegnerlukas.strategygame.backend.ports.required.persistence.game

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.shared.either.Either

interface GameQuery {

	/**
	 * Find the game with the given id
	 */
	suspend fun execute(id: String): Either<GameEntity, ApplicationError>

}