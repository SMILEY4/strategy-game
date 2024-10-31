package io.github.smiley4.strategygame.backend.worlds.module.persistence

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.worlds.module.persistence.entities.CommandEntity


internal class CommandsByGameQuery(private val database: ArangoDatabase) {

    private val metricId = MetricId.query(CommandsByGameQuery::class)

    suspend fun execute(gameId: Game.Id, turn: Int): List<Command<*>> {
        database.assertCollections(Collections.COMMANDS)
        return time(metricId) {
            database.query(
                //language=aql
                """
				FOR command IN ${Collections.COMMANDS}
					FILTER command.gameId == @gameId AND command.turn == @turn
					RETURN command
                """.trimIndent(),
                mapOf("gameId" to gameId.value, "turn" to turn),
                CommandEntity::class.java
            ).map { it.asServiceModel() }
        }
    }

}