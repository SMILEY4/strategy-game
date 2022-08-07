package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.CommandsByGameQuery
import de.ruegnerlukas.strategygame.backend.shared.arango.ArangoDatabase

class CommandsByGameQueryImpl(private val database: ArangoDatabase) : CommandsByGameQuery {

	private val query = """
		FOR command IN ${Collections.COMMANDS}
			FOR country IN ${Collections.COUNTRIES}
				FILTER command.countryId == country._key AND country.gameId == @gameId AND command.turn == @turn
				RETURN command
	""".trimIndent()

	override suspend fun execute(gameId: String, turn: Int): List<CommandEntity<*>> {
		database.assertCollections(Collections.COMMANDS, Collections.COUNTRIES)
		return database.query(query, mapOf("gameId" to gameId, "turn" to turn), CommandEntity::class.java)?.toList() ?: emptyList()
	}

}