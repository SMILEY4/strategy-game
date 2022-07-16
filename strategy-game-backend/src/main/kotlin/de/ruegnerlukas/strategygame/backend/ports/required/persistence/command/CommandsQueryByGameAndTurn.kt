package de.ruegnerlukas.strategygame.backend.ports.required.persistence.command

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity

interface CommandsQueryByGameAndTurn {

	/**
	 * Find the commands for the given game and turn
	 */
	suspend fun execute(gameId: String, turn: Int): Either<DatabaseError, List<CommandEntity>>

}