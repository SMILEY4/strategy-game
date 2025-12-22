package io.github.smiley4.strategygame.backend.sessions.infrastructure

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.sessions._old.application.persistence.DbCollections
import io.github.smiley4.strategygame.backend.sessions._old.application.persistence.GameInsert
import io.github.smiley4.strategygame.backend.sessions.infrastructure.entities.GameEntity
import io.github.smiley4.strategygame.backend.sessions.create.GameDbInsert

class GameDbInsertImpl(private val database: ArangoDatabase) : GameDbInsert {

    private val metricId = MetricId.query(GameInsert::class)

    override suspend fun insert(game: Game): String {
        return time(metricId) {
            database.insertDocument(DbCollections.GAMES, GameEntity.of(game)).key
        }
    }
}