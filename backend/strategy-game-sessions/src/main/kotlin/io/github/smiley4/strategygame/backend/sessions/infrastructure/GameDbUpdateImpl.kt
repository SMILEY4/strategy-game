package io.github.smiley4.strategygame.backend.sessions.infrastructure

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commonarangodb.DocumentNotFoundError
import io.github.smiley4.strategygame.backend.commonarangodb.EntityNotFoundError
import io.github.smiley4.strategygame.backend.commondata.DbCollections
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.sessions.infrastructure.entities.GameEntity

class GameDbUpdateImpl(private val database: ArangoDatabase) :
    io.github.smiley4.strategygame.backend.sessions.connect.GameDbUpdate,
    io.github.smiley4.strategygame.backend.sessions.join.GameDbUpdate,
    io.github.smiley4.strategygame.backend.sessions.disconnectplayer.GameDbUpdate,
    io.github.smiley4.strategygame.backend.sessions.turnend.GameDbUpdate,
    io.github.smiley4.strategygame.backend.sessions.turnsubmit.GameDbUpdate {

    private val metricId = MetricId.query(GameDbUpdateImpl::class)

    override suspend fun update(game: Game) {
        val entity = GameEntity.of(game)
        return time(metricId) {
            try {
                database.replaceDocument(DbCollections.GAMES, entity.getKeyOrThrow(), entity)
            } catch (e: DocumentNotFoundError) {
                throw EntityNotFoundError()
            }
        }
    }

}