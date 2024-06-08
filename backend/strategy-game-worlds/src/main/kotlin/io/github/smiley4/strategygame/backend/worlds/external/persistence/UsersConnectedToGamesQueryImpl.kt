package io.github.smiley4.strategygame.backend.worlds.external.persistence

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.persistence.Collections
import io.github.smiley4.strategygame.backend.common.persistence.arango.ArangoDatabase
import io.github.smiley4.strategygame.backend.worlds.ports.required.UsersConnectedToGamesQuery


class UsersConnectedToGamesQueryImpl(private val database: ArangoDatabase) : UsersConnectedToGamesQuery {

    private val metricId = MetricId.query(UsersConnectedToGamesQuery::class)

    override suspend fun execute(): List<String> {
        return time(metricId) {
            database.assertCollections(Collections.GAMES)
            database.query(
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
            )
        }
    }

}