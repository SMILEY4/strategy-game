package io.github.smiley4.strategygame.backend.sessions.application.persistence

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.utils.parallelIO
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commondata.Game


internal class GameDelete(private val database: ArangoDatabase) {

    private val metricId = MetricId.query(GameDelete::class)

    suspend fun execute(game: Game.Id) {
        time(metricId) {
            database.assertCollections(
                DbCollections.GAMES,
                DbCollections.COMMANDS,
                DbCollections.REALMS,
                DbCollections.TILES,
                DbCollections.WORLD_OBJECTS,
            )
            parallelIO(
                { deleteGame(game) },
                { deleteCommands(game) },
                { deleteRealms(game) },
                { deleteTiles(game) },
                { deleteWorldObjects(game) },
            )
        }
    }

    private suspend fun deleteGame(gameId: Game.Id) {
        database.deleteDocument(DbCollections.GAMES, gameId.value)
    }

    private suspend fun deleteRealms(gameId: Game.Id) {
        database.execute(
            //language=aql
            """
				FOR realm IN ${DbCollections.REALMS}
					FILTER realm.gameId == @gameId
                    REMOVE realm in ${DbCollections.REALMS}
            """.trimIndent(),
            mapOf("gameId" to gameId.value)
        )
    }

    private suspend fun deleteTiles(gameId: Game.Id) {
        database.execute(
            //language=aql
            """
                FOR tile IN ${DbCollections.TILES}
                    FILTER tile.gameId == @gameId
                    REMOVE tile in ${DbCollections.TILES}
            """.trimIndent(),
            mapOf("gameId" to gameId.value)
        )
    }

    private suspend fun deleteWorldObjects(gameId: Game.Id) {
        database.execute(
            //language=aql
            """
				FOR worldObject IN ${DbCollections.WORLD_OBJECTS}
					FILTER worldObject.gameId == @gameId
                    REMOVE worldObject in ${DbCollections.WORLD_OBJECTS}
            """.trimIndent(),
            mapOf("gameId" to gameId.value)
        )
    }

    private suspend fun deleteCommands(gameId: Game.Id) {
        database.execute(
            //language=aql
            """
				FOR command IN ${DbCollections.COMMANDS}
					FILTER command.gameId == @gameId
                    REMOVE command in ${DbCollections.COMMANDS}
            """.trimIndent(),
            mapOf("gameId" to gameId.value)
        )
    }

}