package de.ruegnerlukas.strategygame.backend.ports.required.persistence.gameext

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.ExtGameEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError

interface ExtGameQuery {

	data class Include(
		val includeTiles: Boolean = false,
		val includeMarkers: Boolean = false,
		val includePlayers: Boolean = false,
		val includeCountries: Boolean = false,
	)

	/**
	 * Fetch the extended-game object by the game-id
	 */
	suspend fun execute(gameId: String, include: Include): Either<DatabaseError, ExtGameEntity>


}