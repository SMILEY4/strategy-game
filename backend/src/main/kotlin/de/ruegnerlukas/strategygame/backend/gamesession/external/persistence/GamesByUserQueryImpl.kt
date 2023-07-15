package de.ruegnerlukas.strategygame.backend.gamesession.external.persistence

import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring.time
import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Game
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GamesByUserQuery

class GamesByUserQueryImpl(private val database: ArangoDatabase) : GamesByUserQuery {

    private val metricId = MetricId.query(GamesByUserQuery::class)

    override suspend fun execute(userId: String): List<Game> {
        return time(metricId) {
            database.assertCollections(Collections.GAMES)
            database.query(
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

}