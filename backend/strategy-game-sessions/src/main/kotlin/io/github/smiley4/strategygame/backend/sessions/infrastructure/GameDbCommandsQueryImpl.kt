package io.github.smiley4.strategygame.backend.sessions.infrastructure

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.DbCollections
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.sessions.infrastructure.entities.CommandEntity
import io.github.smiley4.strategygame.backend.sessions.turnend.GameDbCommandsQuery

class GameDbCommandsQueryImpl(private val database: ArangoDatabase) : GameDbCommandsQuery {

    private val metricId = MetricId.query(GameDbCommandsQueryImpl::class)

    override suspend fun query(game: Game.Id, turn: Int): List<Command<*>> {
        database.assertCollections(DbCollections.COMMANDS)
        return time(metricId) {
            database.query(
                //language=aql
                """
				FOR command IN ${DbCollections.COMMANDS}
					FILTER command.gameId == @gameId AND command.turn == @turn
					RETURN command
                """.trimIndent(),
                mapOf("gameId" to game.value, "turn" to turn),
                CommandEntity::class.java
            ).map { it.asServiceModel() }
        }
    }

}