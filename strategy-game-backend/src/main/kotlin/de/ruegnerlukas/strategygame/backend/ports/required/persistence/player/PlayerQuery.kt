package de.ruegnerlukas.strategygame.backend.ports.required.persistence.player

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.shared.either.Either

interface PlayerQuery {

	/**
	 * Find the given player by the id
	 */
	suspend fun execute(id: String): Either<PlayerEntity, ApplicationError>

}