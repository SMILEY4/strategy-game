package de.ruegnerlukas.strategygame.backend.ports.required.persistence.order

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.OrderEntity
import de.ruegnerlukas.strategygame.backend.shared.either.Either

interface OrderInsertMultiple {

	/**
	 * Insert the given orders
	 */
	suspend fun execute(orders: List<OrderEntity>): Either<Unit, ApplicationError>

}