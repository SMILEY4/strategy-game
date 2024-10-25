package io.github.smiley4.strategygame.backend.worlds.module.persistence

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commondata.User


internal class UsersConnectedToGamesQuery(private val database: ArangoDatabase) {

    private val metricId = MetricId.query(UsersConnectedToGamesQuery::class)

    suspend fun execute(): List<User.Id> {
        return time(metricId) {
            database.assertCollections(Collections.GAMES)
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