package io.github.smiley4.strategygame.backend.sessions.infrastructure

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commondata.DbCollections
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.sessions.infrastructure.entities.GameEntity

class GameDbQueryByUserImpl(private val database: ArangoDatabase) :
    io.github.smiley4.strategygame.backend.sessions.list.GameDbQueryByUser {

    private val metricId = MetricId.query(GameDbQueryByUserImpl::class)

    override suspend fun query(user: User.Id): List<Game> {
        return time(metricId) {
            database.assertCollections(DbCollections.GAMES)
            database.query(
                //language=aql
                """
				FOR game IN ${DbCollections.GAMES}
					FILTER game.players[*].userId ANY == @userId
					RETURN game
                """.trimIndent(),
                mapOf("userId" to user.value),
                GameEntity::class.java
            ).map { it.asServiceModel() }
        }
    }
}