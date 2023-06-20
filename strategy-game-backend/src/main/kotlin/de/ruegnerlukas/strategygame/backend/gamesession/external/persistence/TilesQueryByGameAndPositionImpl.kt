package de.ruegnerlukas.strategygame.backend.gamesession.external.persistence

import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.common.models.TilePosition
import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricDbQuery
import de.ruegnerlukas.strategygame.backend.common.persistence.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.TilesQueryByGameAndPosition

class TilesQueryByGameAndPositionImpl(private val database: ArangoDatabase) : TilesQueryByGameAndPosition {

    private val metricId = metricDbQuery(TilesQueryByGameAndPosition::class)

    override suspend fun execute(gameId: String, positions: List<TilePosition>): List<Tile> {
        return Monitoring.coTime(metricId) {
            database.assertCollections(Collections.TILES)
            database.query(
                """
                FOR tile IN ${Collections.TILES}
                    FILTER tile.gameId == @gameId
                    FILTER CONTAINS_ARRAY(${strPos(positions)}, tile.position)
                    RETURN tile
                """.trimIndent(),
                mapOf("gameId" to gameId),
                TileEntity::class.java
            ).map { it.asServiceModel() }
        }
    }

    private fun strPos(positions: List<TilePosition>): String {
        return positions.joinToString(separator = ",") { "{q: ${it.q}, r: ${it.r}}" }.let { "[$it]" }
    }

}