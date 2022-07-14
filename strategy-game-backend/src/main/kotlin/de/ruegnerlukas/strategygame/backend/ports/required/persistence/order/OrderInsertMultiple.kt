package de.ruegnerlukas.strategygame.backend.ports.required.persistence.order

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.errors.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.OrderEntity

interface OrderInsertMultiple {

	/**
	 * Insert the given orders
	 */
	suspend fun execute(orders: List<OrderEntity>): Either<DatabaseError, Unit>

}