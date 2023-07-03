package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence

import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameExistsQuery

class GameExistsQueryImpl(val database: ArangoDatabase) : GameExistsQuery {

    private val metricId = MetricId.query(GameExistsQuery::class)

    override suspend fun perform(gameId: String): Boolean {
        return Monitoring.time(metricId) {
            database.existsDocument(Collections.GAMES, gameId)
        }
    }

}