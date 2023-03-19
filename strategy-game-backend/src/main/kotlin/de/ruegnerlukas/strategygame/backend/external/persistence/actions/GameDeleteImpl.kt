package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.ports.required.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.monitoring.MonitoringService.Companion.metricDbQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameDelete
import de.ruegnerlukas.strategygame.backend.shared.parallelIO

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