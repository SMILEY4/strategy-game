package de.ruegnerlukas.strategygame.backend.ports.required.persistence.order

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.OrderEntity

interface OrderQueryByGameAndTurn {

	/**
	 * Find the orders of the given game and turn
	 */
	suspend fun execute(gameId: String, turn: Int): Either<DatabaseError, List<OrderEntity>>

}