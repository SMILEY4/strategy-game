package io.github.smiley4.strategygame.backend.worlds.external.persistence

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.persistence.Collections
import io.github.smiley4.strategygame.backend.common.persistence.EntityNotFoundError
import io.github.smiley4.strategygame.backend.common.persistence.arango.ArangoDatabase
import io.github.smiley4.strategygame.backend.common.persistence.arango.DocumentNotFoundError
import io.github.smiley4.strategygame.backend.common.models.GameEntity
import io.github.smiley4.strategygame.backend.common.models.Game
import io.github.smiley4.strategygame.backend.worlds.ports.required.GameUpdate

class GameUpdateImpl(private val database: ArangoDatabase) : GameUpdate {

    private val metricId = MetricId.query(GameUpdate::class)

    override suspend fun execute(game: Game) {
        val entity = GameEntity.of(game)
        return time(metricId) {
            try {
                database.replaceDocument(Collections.GAMES, entity.getKeyOrThrow(), entity)
            } catch (e: DocumentNotFoundError) {
                throw EntityNotFoundError()
            }
        }
    }

}