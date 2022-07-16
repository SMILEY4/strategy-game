package de.ruegnerlukas.strategygame.backend.ports.required.persistence.command

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity

interface CommandsInsertMultiple {

	/**
	 * Insert the given commands
	 */
	suspend fun execute(commands: List<CommandEntity>): Either<DatabaseError, Unit>

}