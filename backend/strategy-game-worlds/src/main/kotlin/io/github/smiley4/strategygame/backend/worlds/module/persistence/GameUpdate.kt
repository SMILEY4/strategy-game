package io.github.smiley4.strategygame.backend.worlds.module.persistence

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commonarangodb.DocumentNotFoundError
import io.github.smiley4.strategygame.backend.commonarangodb.EntityNotFoundError
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.worlds.module.persistence.entities.GameEntity


internal class GameUpdate(private val database: ArangoDatabase) {

    private val metricId = MetricId.query(GameUpdate::class)

    suspend fun execute(game: Game) {
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