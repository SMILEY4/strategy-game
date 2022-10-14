package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.external.persistence.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.Game
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GamesByUserQuery

class GamesByUserQueryImpl(private val database: ArangoDatabase) : GamesByUserQuery {

    override suspend fun execute(userId: String): List<Game> {
        database.assertCollections(Collections.GAMES)
        return database.query(
            """
				FOR game IN ${Collections.GAMES}
					FILTER game.players[*].userId ANY == @userId
					RETURN game
			""".trimIndent(),
            mapOf("userId" to userId),
            GameEntity::class.java
        ).map { it.asServiceModel() }
    }

}