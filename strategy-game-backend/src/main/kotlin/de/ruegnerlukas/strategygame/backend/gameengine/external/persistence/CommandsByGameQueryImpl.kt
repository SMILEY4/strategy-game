package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence

import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.Command
import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.common.persistence.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricDbQuery
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.CommandsByGameQuery

class CommandsByGameQueryImpl(private val database: ArangoDatabase) : CommandsByGameQuery {

    private val metricId = metricDbQuery(CommandsByGameQuery::class)

    override suspend fun execute(gameId: String, turn: Int): List<Command<*>> {
        database.assertCollections(Collections.COMMANDS, Collections.COUNTRIES)
        return Monitoring.coTime(metricId) {
            database.query(
                """
				FOR command IN ${Collections.COMMANDS}
					FOR country IN ${Collections.COUNTRIES}
						FILTER command.countryId == country._key AND country.gameId == @gameId AND command.turn == @turn
						RETURN command
                """.trimIndent(),
                mapOf("gameId" to gameId, "turn" to turn),
                CommandEntity::class.java
            ).map { it.asServiceModel() }
        }
    }

}