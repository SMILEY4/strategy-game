package io.github.smiley4.strategygame.backend.worlds.external.persistence

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.persistence.Collections
import io.github.smiley4.strategygame.backend.common.persistence.arango.ArangoDatabase
import io.github.smiley4.strategygame.backend.worlds.external.persistence.entities.CommandEntity
import io.github.smiley4.strategygame.backend.common.models.Command
import io.github.smiley4.strategygame.backend.worlds.ports.required.CommandsByGameQuery


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