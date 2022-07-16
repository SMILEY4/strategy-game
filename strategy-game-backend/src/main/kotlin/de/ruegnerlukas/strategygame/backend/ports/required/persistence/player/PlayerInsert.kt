package de.ruegnerlukas.strategygame.backend.ports.required.persistence.player

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity

interface PlayerInsert {

	/**
	 * Insert the given player
	 */
	suspend fun execute(player: PlayerEntity): Either<DatabaseError, Unit>

}
