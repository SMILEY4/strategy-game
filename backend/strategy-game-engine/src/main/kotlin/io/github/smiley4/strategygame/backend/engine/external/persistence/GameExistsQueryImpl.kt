package io.github.smiley4.strategygame.backend.engine.external.persistence

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring
import io.github.smiley4.strategygame.backend.common.persistence.Collections
import io.github.smiley4.strategygame.backend.common.persistence.arango.ArangoDatabase
import io.github.smiley4.strategygame.backend.engine.ports.required.GameExistsQuery


class GameExistsQueryImpl(val database: ArangoDatabase) : GameExistsQuery {

    private val metricId = MetricId.query(GameExistsQuery::class)

    override suspend fun perform(gameId: String): Boolean {
        return Monitoring.time(metricId) {
            database.existsDocument(Collections.GAMES, gameId)
        }
    }

}