package io.github.smiley4.strategygame.backend.worlds.module.persistence

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.utils.parallelIO
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase


internal class GameDelete(private val database: ArangoDatabase) {

    private val metricId = MetricId.query(GameDelete::class)

    suspend fun execute(gameId: String) {
        time(metricId) {
            database.assertCollections(
                Collections.GAMES,
                Collections.COUNTRIES,
                Collections.TILES,
                Collections.CITIES,
                Collections.COMMANDS,
                Collections.PROVINCES,
                Collections.ROUTES,
            )
            parallelIO(
                { deleteGame(gameId) },
                { deleteCountries(gameId) },
                { deleteTiles(gameId) },
                { deleteCities(gameId) },
                { deleteCommands(gameId) },
                { deleteProvinces(gameId) },
                { deleteRoutes(gameId) }
            )
        }
    }

    private suspend fun deleteGame(gameId: String) {
        database.deleteDocument(Collections.GAMES, gameId)
    }

    private suspend fun deleteCountries(gameId: String) {
        database.execute(
            """
				FOR country IN ${Collections.COUNTRIES}
					FILTER country.gameId == @gameId
                    REMOVE country in ${Collections.COUNTRIES}
            """.trimIndent(),
            mapOf("gameId" to gameId)
        )
    }

    private suspend fun deleteTiles(gameId: String) {
        database.execute(
            """
                FOR tile IN ${Collections.TILES}
                    FILTER tile.gameId == @gameId
                    REMOVE tile in ${Collections.TILES}
            """.trimIndent(),
            mapOf("gameId" to gameId)
        )
    }


    private suspend fun deleteCities(gameId: String) {
        database.execute(
            """
				FOR city IN ${Collections.CITIES}
					FILTER city.gameId == @gameId
                    REMOVE city in ${Collections.CITIES}
            """.trimIndent(),
            mapOf("gameId" to gameId)
        )
    }

    private suspend fun deleteCommands(gameId: String) {
        database.execute(
            """
				FOR command IN ${Collections.COMMANDS}
					FILTER command.gameId == @gameId
                    REMOVE command in ${Collections.COMMANDS}
            """.trimIndent(),
            mapOf("gameId" to gameId)
        )
    }

    private suspend fun deleteProvinces(gameId: String) {
        database.execute(
            """
				FOR province IN ${Collections.PROVINCES}
					FILTER province.gameId == @gameId
                    REMOVE province in ${Collections.PROVINCES}
            """.trimIndent(),
            mapOf("gameId" to gameId)
        )
    }

    private suspend fun deleteRoutes(gameId: String) {
        database.execute(
            """
				FOR route IN ${Collections.ROUTES}
					FILTER route.gameId == @gameId
                    REMOVE route in ${Collections.ROUTES}
            """.trimIndent(),
            mapOf("gameId" to gameId)
        )
    }

}