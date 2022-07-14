package de.ruegnerlukas.strategygame.backend.ports.required.persistence.player

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.errors.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity

interface PlayersQueryByGameConnected {

	/**
	 * Find all players of the given game that are connected (i.e. connectionId != null)
	 */
	suspend fun execute(gameId: String): Either<DatabaseError, List<PlayerEntity>>


}