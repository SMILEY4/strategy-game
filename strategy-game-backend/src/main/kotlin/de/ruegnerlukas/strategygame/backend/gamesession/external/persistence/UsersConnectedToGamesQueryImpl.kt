package de.ruegnerlukas.strategygame.backend.gamesession.external.persistence

import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring.time
import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.UsersConnectedToGamesQuery

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