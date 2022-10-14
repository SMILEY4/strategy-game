package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.CommandsByGameQuery
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase

class CommandsByGameQueryImpl(private val database: ArangoDatabase) : CommandsByGameQuery {

	override suspend fun execute(gameId: String, turn: Int): List<Command<*>> {
		database.assertCollections(Collections.COMMANDS, Collections.COUNTRIES)
		return database.query(
			"""
				FOR command IN ${Collections.COMMANDS}
					FOR country IN ${Collections.COUNTRIES}
						FILTER command.countryId == country._key AND country.gameId == @gameId AND command.turn == @turn
						RETURN command
			""".trimIndent(),
			mapOf("gameId" to gameId, "turn" to turn),
			Command::class.java
		)
	}

}