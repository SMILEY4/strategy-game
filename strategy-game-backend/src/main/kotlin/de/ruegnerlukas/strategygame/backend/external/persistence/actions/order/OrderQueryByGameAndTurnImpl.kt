package de.ruegnerlukas.strategygame.backend.external.persistence.actions.order

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.and
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.OrderTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.OrderEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.order.OrderQueryByGameAndTurn
import de.ruegnerlukas.strategygame.backend.shared.either.Either

class OrderQueryByGameAndTurnImpl(private val database: Database) : OrderQueryByGameAndTurn {

	override suspend fun execute(gameId: String, turn: Int): Either<List<OrderEntity>, ApplicationError> {
		return Either.run {
			database
				.startQuery("order.query.by_game_and_turn") {
					SQL
						.select(OrderTbl.id, OrderTbl.playerId, OrderTbl.turn, OrderTbl.data)
						.from(OrderTbl, PlayerTbl)
						.where(
							OrderTbl.playerId.isEqual(PlayerTbl.id)
									and PlayerTbl.gameId.isEqual(placeholder("gameId"))
									and OrderTbl.turn.isEqual(placeholder("turn"))
						)
				}
				.parameters {
					it["gameId"] = gameId
					it["turn"] = turn
				}
				.execute()
				.getMultipleOrNone { rs ->
					OrderEntity(
						id = rs.getString(OrderTbl.id),
						playerId = rs.getString(OrderTbl.playerId),
						turn = rs.getInt(OrderTbl.turn),
						data = rs.getString(OrderTbl.data)
					)
				}
		}
	}

}