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
                DbCollections.COUNTRIES,
                DbCollections.TILES,
                DbCollections.WORLD_OBJECTS,
                DbCollections.SETTLEMENTS,
                DbCollections.COMMANDS,
                DbCollections.PROVINCES,
                DbCollections.ROUTES,
            )
            parallelIO(
                { deleteGame(game) },
                { deleteCountries(game) },
                { deleteTiles(game) },
                { deleteWorldObjects(game) },
                { deleteCities(game) },
                { deleteCommands(game) },
                { deleteProvinces(game) },
                { deleteRoutes(game) }
            )
        }
    }

    private suspend fun deleteGame(gameId: Game.Id) {
        database.deleteDocument(DbCollections.GAMES, gameId.value)
    }

    private suspend fun deleteCountries(gameId: Game.Id) {
        database.execute(
            //language=aql
            """
				FOR country IN ${DbCollections.COUNTRIES}
					FILTER country.gameId == @gameId
                    REMOVE country in ${DbCollections.COUNTRIES}
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

    private suspend fun deleteCities(gameId: Game.Id) {
        database.execute(
            //language=aql
            """
				FOR city IN ${DbCollections.SETTLEMENTS}
					FILTER city.gameId == @gameId
                    REMOVE city in ${DbCollections.SETTLEMENTS}
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

    private suspend fun deleteProvinces(gameId: Game.Id) {
        database.execute(
            //language=aql
            """
				FOR province IN ${DbCollections.PROVINCES}
					FILTER province.gameId == @gameId
                    REMOVE province in ${DbCollections.PROVINCES}
            """.trimIndent(),
            mapOf("gameId" to gameId.value)
        )
    }

    private suspend fun deleteRoutes(gameId: Game.Id) {
        database.execute(
            //language=aql
            """
				FOR route IN ${DbCollections.ROUTES}
					FILTER route.gameId == @gameId
                    REMOVE route in ${DbCollections.ROUTES}
            """.trimIndent(),
            mapOf("gameId" to gameId.value)
        )
    }

}