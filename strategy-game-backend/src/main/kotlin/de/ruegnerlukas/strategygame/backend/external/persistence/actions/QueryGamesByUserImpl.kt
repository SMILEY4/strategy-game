package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryGamesByUser
import de.ruegnerlukas.strategygame.backend.shared.arango.ArangoDatabase

class QueryGamesByUserImpl(private val database: ArangoDatabase) : QueryGamesByUser {

	private val query = """
		FOR game IN ${Collections.GAMES}
			FILTER game.players[*].userId ANY == @userId
			RETURN game
	""".trimIndent()

	override suspend fun execute(userId: String): List<GameEntity> {
		database.assertCollections(Collections.GAMES)
		return database.query(query, mapOf("userId" to userId), GameEntity::class.java)?.toList() ?: emptyList()
	}

}