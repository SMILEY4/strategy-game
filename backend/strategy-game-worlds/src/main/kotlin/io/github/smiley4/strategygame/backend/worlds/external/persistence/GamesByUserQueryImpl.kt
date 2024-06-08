package io.github.smiley4.strategygame.backend.worlds.external.persistence

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.persistence.Collections
import io.github.smiley4.strategygame.backend.common.persistence.arango.ArangoDatabase
import io.github.smiley4.strategygame.backend.common.models.GameEntity
import io.github.smiley4.strategygame.backend.common.models.Game
import io.github.smiley4.strategygame.backend.worlds.ports.required.GamesByUserQuery


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