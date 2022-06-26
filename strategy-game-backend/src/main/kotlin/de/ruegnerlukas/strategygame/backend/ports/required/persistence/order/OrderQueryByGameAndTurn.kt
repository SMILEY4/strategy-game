package de.ruegnerlukas.strategygame.backend.ports.required.persistence.order

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.OrderEntity
import de.ruegnerlukas.strategygame.backend.shared.either.Either

interface OrderQueryByGameAndTurn {

	/**
	 * Find the orders of the given game and turn
	 */
	suspend fun execute(gameId: String, turn: Int): Either<List<OrderEntity>, ApplicationError>

}