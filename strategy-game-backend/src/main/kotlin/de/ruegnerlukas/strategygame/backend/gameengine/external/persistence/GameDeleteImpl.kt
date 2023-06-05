package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence

import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricDbQuery
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameDelete
import de.ruegnerlukas.strategygame.backend.common.parallelIO

class GameDeleteImpl(private val database: ArangoDatabase) : GameDelete {

    private val metricId = metricDbQuery(GameDelete::class)

    override suspend fun execute(gameId: String) {
        Monitoring.coTime(metricId) {
            parallelIO(
                { deleteGame(gameId) },
                { deleteTiles(gameId) },
                { deleteCountries(gameId) },
                { deleteCities(gameId) }
            )
        }
    }

    private suspend fun deleteGame(gameId: String) {
        database.deleteDocument(Collections.GAMES, gameId)
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

}