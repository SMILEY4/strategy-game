package de.ruegnerlukas.strategygame.backend.ports.required.persistence.player

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.shared.either.Either

interface PlayersQueryByGameStatePlaying {

	/**
	 * Find all players of the given game in state [PlayerEntity.STATE_PLAYING]
	 */
	suspend fun execute(gameId: String): Either<List<PlayerEntity>, ApplicationError>
}