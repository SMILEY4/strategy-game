package io.github.smiley4.strategygame.backend.sessions.infrastructure

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.sessions._old.application.persistence.DbCollections
import io.github.smiley4.strategygame.backend.sessions.disconnectall.GameDbQueryConnectedUsers

class GameDbQueryConnectedUsersImpl(private val database: ArangoDatabase) : GameDbQueryConnectedUsers {

    private val metricId = MetricId.query(GameDbQueryConnectedUsersImpl::class)

    override suspend fun query(): List<User.Id> {
        return time(metricId) {
            database.assertCollections(DbCollections.GAMES)
            database.query(
                //language=aql
                """
                FOR uid IN (
                    FLATTEN(
                        FOR game IN games
                            LET connectionIds = REMOVE_VALUE(game.players[*].connectionId, null)
                            FILTER LENGTH(connectionIds) > 0
                            LET userIds = game.players[*].userId
                            RETURN userIds
                    )
                )
                    RETURN DISTINCT uid
                """.trimIndent(),
                String::class.java
            ).map { User.Id(it) }
        }
    }
}