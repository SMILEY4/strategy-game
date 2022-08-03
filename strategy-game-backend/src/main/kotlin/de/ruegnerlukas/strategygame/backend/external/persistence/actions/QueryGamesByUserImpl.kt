package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryGamesByUser
import de.ruegnerlukas.strategygame.backend.shared.arango.ArangoDatabase

class QueryGamesByUserImpl(private val database: ArangoDatabase) : QueryGamesByUser {

	val query = """
		FOR game IN games
			FILTER game.players[*].userId ANY == @userId
			RETURN game._key
	""".trimIndent()

	override suspend fun execute(userId: String): List<GameEntity> {
		return database.query(query, mapOf("userId" to userId), GameEntity::class.java)?.toList() ?: emptyList()
	}
}