package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.CommandsInsert
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.external.persistence.entities.CommandEntity

class CommandsInsertImpl(private val database: ArangoDatabase) : CommandsInsert {

	override suspend fun execute(commands: List<Command<*>>) {
		database.insertDocuments(Collections.COMMANDS, commands.map { CommandEntity.of(it) })
	}
}