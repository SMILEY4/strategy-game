package io.github.smiley4.strategygame.backend.worlds.external.persistence

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.persistence.Collections
import io.github.smiley4.strategygame.backend.common.persistence.EntityNotFoundError
import io.github.smiley4.strategygame.backend.common.persistence.arango.ArangoDatabase
import io.github.smiley4.strategygame.backend.common.persistence.arango.DocumentNotFoundError
import io.github.smiley4.strategygame.backend.common.models.GameEntity
import io.github.smiley4.strategygame.backend.common.models.Game
import io.github.smiley4.strategygame.backend.worlds.ports.required.GameQuery

class GameQueryImpl(private val database: ArangoDatabase) : GameQuery {

    private val metricId = MetricId.query(GameQuery::class)

    override suspend fun execute(gameId: String): Game {
        return time(metricId) {
            try {
                database.getDocument(Collections.GAMES, gameId, GameEntity::class.java).asServiceModel()
            } catch (e: DocumentNotFoundError) {
                throw EntityNotFoundError()
            }
        }
    }

}