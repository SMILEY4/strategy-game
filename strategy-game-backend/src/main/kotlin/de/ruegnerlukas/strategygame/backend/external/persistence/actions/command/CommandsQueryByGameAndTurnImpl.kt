package de.ruegnerlukas.strategygame.backend.external.persistence.actions.command

import arrow.core.Either
import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.and
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.CommandTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.command.CommandsQueryByGameAndTurn

class CommandsQueryByGameAndTurnImpl(private val database: Database) : CommandsQueryByGameAndTurn {

	override suspend fun execute(gameId: String, turn: Int): Either<DatabaseError, List<CommandEntity>> {
		return Either
			.catch {
				database
					.startQuery("command.query.by_game_and_turn") {
						SQL
							.select(CommandTbl.id, CommandTbl.playerId, CommandTbl.turn, CommandTbl.type, CommandTbl.data)
							.from(CommandTbl, PlayerTbl)
							.where(
								CommandTbl.playerId.isEqual(PlayerTbl.id)
										and PlayerTbl.gameId.isEqual(placeholder("gameId"))
										and CommandTbl.turn.isEqual(placeholder("turn"))
							)
					}
					.parameters {
						it["gameId"] = gameId
						it["turn"] = turn
					}
					.execute()
					.getMultipleOrNone { rs ->
						CommandEntity(
							id = rs.getString(CommandTbl.id),
							playerId = rs.getString(CommandTbl.playerId),
							turn = rs.getInt(CommandTbl.turn),
							type = rs.getString(CommandTbl.type),
							data = rs.getString(CommandTbl.data)
						)
					}
			}
			.mapLeft { throw it }
	}

}