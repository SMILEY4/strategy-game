package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.InsertCommands
import de.ruegnerlukas.strategygame.backend.shared.arango.ArangoDatabase

class InsertCommandsImpl(private val database: ArangoDatabase) : InsertCommands {

	override suspend fun execute(commands: List<CommandEntity<*>>) {
		database.insertDocuments(Collections.COMMANDS, commands)
	}
}