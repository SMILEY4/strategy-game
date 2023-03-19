package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.ports.required.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.monitoring.MonitoringService
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.UsersConnectedToGamesQuery

class UsersConnectedToGamesQueryImpl(private val database: ArangoDatabase) : UsersConnectedToGamesQuery {

    private val metricId = MonitoringService.metricDbQuery(UsersConnectedToGamesQuery::class)

    override suspend fun execute(): List<String> {
        return Monitoring.coTime(metricId) {
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