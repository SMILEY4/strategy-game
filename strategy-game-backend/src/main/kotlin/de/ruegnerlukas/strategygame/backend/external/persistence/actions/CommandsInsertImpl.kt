package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.CommandsInsert
import de.ruegnerlukas.strategygame.backend.shared.arango.ArangoDatabase

class CommandsInsertImpl(private val database: ArangoDatabase) : CommandsInsert {

	override suspend fun execute(commands: List<CommandEntity<*>>) {
		database.insertDocuments(Collections.COMMANDS, commands)
	}
}