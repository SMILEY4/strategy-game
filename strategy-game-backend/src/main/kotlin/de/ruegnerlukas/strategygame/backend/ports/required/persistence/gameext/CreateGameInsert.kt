package de.ruegnerlukas.strategygame.backend.ports.required.persistence.gameext

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameCreateEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError

interface CreateGameInsert {

	/**
	 * Insert the extended-game object
	 */
	suspend fun execute(extGame: GameCreateEntity): Either<DatabaseError, Unit>

}