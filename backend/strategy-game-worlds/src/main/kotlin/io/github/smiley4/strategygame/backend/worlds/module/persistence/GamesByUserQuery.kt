package io.github.smiley4.strategygame.backend.worlds.module.persistence

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.worlds.module.persistence.entities.GameEntity


internal class GamesByUserQuery(private val database: ArangoDatabase) {

    private val metricId = MetricId.query(GamesByUserQuery::class)

    suspend fun execute(userId: String): List<Game> {
        return time(metricId) {
            database.assertCollections(Collections.GAMES)
            database.query(
                //language=aql
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