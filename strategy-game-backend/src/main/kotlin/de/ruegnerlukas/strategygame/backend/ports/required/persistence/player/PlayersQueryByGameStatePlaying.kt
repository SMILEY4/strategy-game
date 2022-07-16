package de.ruegnerlukas.strategygame.backend.ports.required.persistence.player

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity

interface PlayersQueryByGameStatePlaying {

	/**
	 * Find all players of the given game in state [PlayerEntity.STATE_PLAYING]
	 */
	suspend fun execute(gameId: String): Either<DatabaseError, List<PlayerEntity>>
}