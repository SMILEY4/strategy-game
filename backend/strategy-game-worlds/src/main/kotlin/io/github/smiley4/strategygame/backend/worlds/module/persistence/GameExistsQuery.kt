package io.github.smiley4.strategygame.backend.worlds.module.persistence

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase


class GameExistsQuery(val database: ArangoDatabase) {

    private val metricId = MetricId.query(GameExistsQuery::class)

    suspend fun perform(gameId: String): Boolean {
        return Monitoring.time(metricId) {
            database.existsDocument(Collections.GAMES, gameId)
        }
    }

}