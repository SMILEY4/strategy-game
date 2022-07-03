package de.ruegnerlukas.strategygame.backend.external.persistence.actions.order

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.OrderTbl
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.OrderEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.order.OrderInsertMultiple
import de.ruegnerlukas.strategygame.backend.shared.either.Either

class OrderInsertMultipleImpl(private val database: Database) : OrderInsertMultiple {

	override suspend fun execute(orders: List<OrderEntity>): Either<Unit, ApplicationError> {
		return Either.run {
			database.insertBatched(50, orders) { batch ->
				SQL
					.insert()
					.into(OrderTbl)
					.columns(OrderTbl.id, OrderTbl.playerId, OrderTbl.turn, OrderTbl.data)
					.items(batch.map {
						SQL.item()
							.set(OrderTbl.id, it.id)
							.set(OrderTbl.playerId, it.playerId)
							.set(OrderTbl.turn, it.turn)
							.set(OrderTbl.data, it.data)
					})
			}
		}
	}


}