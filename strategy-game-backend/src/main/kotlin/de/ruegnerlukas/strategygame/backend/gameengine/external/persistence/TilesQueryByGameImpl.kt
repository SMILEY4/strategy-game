package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence

import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.common.persistence.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricDbQuery
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.TilesQueryByGame

class TilesQueryByGameImpl(private val database: ArangoDatabase) : TilesQueryByGame {

    private val metricId = metricDbQuery(TilesQueryByGame::class)

    override suspend fun execute(gameId: String): List<Tile> {
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
            ).map { it.asServiceModel() }
        }
    }

}