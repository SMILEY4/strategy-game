package io.github.smiley4.strategygame.backend.worlds.module.persistence

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commonarangodb.DocumentNotFoundError
import io.github.smiley4.strategygame.backend.commonarangodb.EntityNotFoundError
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.worlds.module.persistence.entities.GameEntity


internal class GameQuery(private val database: ArangoDatabase) {

    private val metricId = MetricId.query(GameQuery::class)

    suspend fun execute(game: Game.Id): Game {
        return time(metricId) {
            try {
                database.getDocument(Collections.GAMES, game.value, GameEntity::class.java).asServiceModel()
            } catch (e: DocumentNotFoundError) {
                throw EntityNotFoundError()
            }
        }
    }

}