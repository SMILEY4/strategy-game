package de.ruegnerlukas.strategygame.backend.ports.required.persistence.gameext

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.ExtGameEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError

interface ExtGameInsert {

	/**
	 * Insert the extended-game object
	 */
	suspend fun execute(extGame: ExtGameEntity): Either<DatabaseError, Unit>

}