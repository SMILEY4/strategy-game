package de.ruegnerlukas.strategygame.backend.ports.required.persistence.player

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.shared.either.Either

interface PlayersQueryByGameConnected {

	/**
	 * Find all players of the given game that are connected (i.e. connectionId != null)
	 */
	suspend fun execute(gameId: String): Either<List<PlayerEntity>, ApplicationError>


}