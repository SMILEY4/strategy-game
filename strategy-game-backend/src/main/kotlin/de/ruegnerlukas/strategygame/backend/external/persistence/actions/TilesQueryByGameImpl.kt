package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.required.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.MonitoringService.Companion.metricDbQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.TilesQueryByGame

class TilesQueryByGameImpl(private val database: ArangoDatabase) : TilesQueryByGame {

    private val metricId = metricDbQuery(TilesQueryByGame::class)

    override suspend fun execute(gameId: String): List<TileEntity> {
        return Monitoring.coTime(metricId) {
            database.assertCollections(Collections.TILES)
            database.query(
                """
				FOR tile IN ${Collections.TILES}
					FILTER tile.gameId == @gameId
					RETURN tile
                """.trimIndent(),
                mapOf("gameId" to gameId),
                TileEntity::class.java
            )
        }
    }

}