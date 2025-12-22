package io.github.smiley4.strategygame.backend.sessions.infrastructure

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commondata.DbCollections
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.sessions.create.GameDbInsert
import io.github.smiley4.strategygame.backend.sessions.infrastructure.entities.GameEntity

class GameDbInsertImpl(private val database: ArangoDatabase) : GameDbInsert {

    private val metricId = MetricId.query(GameDbInsertImpl::class)

    override suspend fun insert(game: Game): String {
        return time(metricId) {
            database.insertDocument(DbCollections.GAMES, GameEntity.of(game)).key
        }
    }
}