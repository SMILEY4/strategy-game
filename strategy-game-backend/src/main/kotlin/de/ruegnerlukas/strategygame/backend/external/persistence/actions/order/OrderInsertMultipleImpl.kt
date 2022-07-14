package de.ruegnerlukas.strategygame.backend.external.persistence.actions.order

import arrow.core.Either
import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.OrderTbl
import de.ruegnerlukas.strategygame.backend.ports.errors.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.OrderEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.order.OrderInsertMultiple

class OrderInsertMultipleImpl(private val database: Database) : OrderInsertMultiple {

	override suspend fun execute(orders: List<OrderEntity>): Either<DatabaseError, Unit> {
		return Either
			.catch {
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
			.mapLeft { throw it }
	}


}