package de.ruegnerlukas.strategygame.backend.gamesession.external.persistence

import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring.time
import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.common.utils.parallelIO
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameDelete

class GameDeleteImpl(private val database: ArangoDatabase) : GameDelete {

    private val metricId = MetricId.query(GameDelete::class)

    override suspend fun execute(gameId: String) {
        time(metricId) {
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