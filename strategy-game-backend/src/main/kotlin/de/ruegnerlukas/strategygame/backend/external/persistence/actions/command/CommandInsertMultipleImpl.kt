package de.ruegnerlukas.strategygame.backend.external.persistence.actions.command

import arrow.core.Either
import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.CommandTbl
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.command.CommandsInsertMultiple

class CommandInsertMultipleImpl(private val database: Database) : CommandsInsertMultiple {

	override suspend fun execute(commands: List<CommandEntity>): Either<DatabaseError, Unit> {
		return Either
			.catch {
				database.insertBatched(50, commands) { batch ->
					SQL
						.insert()
						.into(CommandTbl)
						.columns(CommandTbl.id, CommandTbl.playerId, CommandTbl.turn, CommandTbl.data)
						.items(batch.map {
							SQL.item()
								.set(CommandTbl.id, it.id)
								.set(CommandTbl.playerId, it.playerId)
								.set(CommandTbl.turn, it.turn)
								.set(CommandTbl.data, it.data)
						})
				}
			}
			.mapLeft { throw it }
	}


}