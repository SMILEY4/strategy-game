package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.external.persistence.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.required.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.MonitoringService.Companion.metricDbQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.TilesQueryByGameAndPosition

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