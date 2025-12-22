package io.github.smiley4.strategygame.backend.sessions.infrastructure

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commonarangodb.DocumentNotFoundError
import io.github.smiley4.strategygame.backend.commonarangodb.EntityNotFoundError
import io.github.smiley4.strategygame.backend.commondata.DbCollections
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.sessions.infrastructure.entities.GameEntity

class GameDbQueryImpl(private val database: ArangoDatabase) :
    io.github.smiley4.strategygame.backend.sessions.connect.GameDbQuery,
    io.github.smiley4.strategygame.backend.sessions.join.GameDbQuery,
    io.github.smiley4.strategygame.backend.sessions.turnend.GameDbQuery,
    io.github.smiley4.strategygame.backend.sessions.turnsubmit.GameDbQuery {

    private val metricId = MetricId.query(GameDbQueryImpl::class)

    override suspend fun query(game: Game.Id): Game {
        return time(metricId) {
            try {
                database.getDocument(DbCollections.GAMES, game.value, GameEntity::class.java).asServiceModel()
            } catch (e: DocumentNotFoundError) {
                throw EntityNotFoundError()
            }
        }
    }

}