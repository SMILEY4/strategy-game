package io.github.smiley4.strategygame.backend.worlds.module.persistence

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.worlds.module.persistence.entities.GameEntity


internal class GameInsert(private val database: ArangoDatabase) {

    private val metricId = MetricId.query(GameInsert::class)

    suspend fun execute(game: Game): String {
        return time(metricId) {
            insertGame(game)
        }
    }

    private suspend fun insertGame(game: Game): String {
        return database.insertDocument(Collections.GAMES, GameEntity.of(game)).key
    }

}