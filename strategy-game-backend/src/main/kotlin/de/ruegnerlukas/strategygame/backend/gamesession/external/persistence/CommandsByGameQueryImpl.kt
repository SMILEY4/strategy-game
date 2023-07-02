package de.ruegnerlukas.strategygame.backend.gamesession.external.persistence

import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring.time
import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Command
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.CommandsByGameQuery

class CommandsByGameQueryImpl(private val database: ArangoDatabase) : CommandsByGameQuery {

    private val metricId = MetricId.query(CommandsByGameQuery::class)

    override suspend fun execute(gameId: String, turn: Int): List<Command<*>> {
        database.assertCollections(Collections.COMMANDS)
        return time(metricId) {
            database.query(
                """
				FOR command IN ${Collections.COMMANDS}
					FILTER command.gameId == @gameId AND command.turn == @turn
					RETURN command
                """.trimIndent(),
                mapOf("gameId" to gameId, "turn" to turn),
                CommandEntity::class.java
            ).map { it.asServiceModel() }
        }
    }

}