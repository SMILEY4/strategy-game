package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.CommandTbl
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.InsertCommands

class InsertCommandsImpl(private val database: Database) : InsertCommands {

	override suspend fun execute(commands: List<CommandEntity>) {
		database
			.insertBatchedTransaction(50, commands) { batch ->
				SQL
					.insert()
					.into(CommandTbl)
					.columns(CommandTbl.id, CommandTbl.playerId, CommandTbl.turn, CommandTbl.type, CommandTbl.data)
					.items(
						batch.map { item ->
							SQL.item()
								.set(CommandTbl.id, item.id)
								.set(CommandTbl.playerId, item.playerId)
								.set(CommandTbl.turn, item.turn)
								.set(CommandTbl.type, item.type)
								.set(CommandTbl.data, item.data)
						}
					)
			}
	}
}