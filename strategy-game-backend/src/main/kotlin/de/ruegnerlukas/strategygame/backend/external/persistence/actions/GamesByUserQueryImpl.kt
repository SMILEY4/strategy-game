package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.required.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.MonitoringService.Companion.metricDbQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GamesByUserQuery

class GamesByUserQueryImpl(private val database: ArangoDatabase) : GamesByUserQuery {

    private val metricId = metricDbQuery(GamesByUserQuery::class)

    override suspend fun execute(userId: String): List<GameEntity> {
        return Monitoring.coTime(metricId) {
            database.assertCollections(Collections.GAMES)
            database.query(
                """
				FOR game IN ${Collections.GAMES}
					FILTER game.players[*].userId ANY == @userId
					RETURN game
                """.trimIndent(),
                mapOf("userId" to userId),
                GameEntity::class.java
            )
        }
    }

}