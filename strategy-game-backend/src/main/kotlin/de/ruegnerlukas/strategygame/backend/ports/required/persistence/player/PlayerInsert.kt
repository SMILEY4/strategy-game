package de.ruegnerlukas.strategygame.backend.ports.required.persistence.player

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.shared.either.Either

interface PlayerInsert {

	/**
	 * Insert the given player
	 */
	suspend fun execute(player: PlayerEntity): Either<Unit, ApplicationError>

}
