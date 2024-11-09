package io.github.smiley4.strategygame.backend.sessions.application.persistence

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commondata.Game


internal class GameExistsQuery(val database: ArangoDatabase) {

    private val metricId = MetricId.query(GameExistsQuery::class)

    suspend fun perform(game: Game.Id): Boolean {
        return Monitoring.time(metricId) {
            database.existsDocument(DbCollections.GAMES, game.value)
        }
    }

}