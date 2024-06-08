package io.github.smiley4.strategygame.backend.engine.external.persistence

import io.github.smiley4.strategygame.backend.common.models.TilePosition
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.persistence.Collections
import io.github.smiley4.strategygame.backend.common.persistence.arango.ArangoDatabase
import io.github.smiley4.strategygame.backend.engine.external.persistence.models.TileEntity
import io.github.smiley4.strategygame.backend.common.models.Tile
import io.github.smiley4.strategygame.backend.engine.ports.required.TilesQueryByGameAndPosition


class TilesQueryByGameAndPositionImpl(private val database: ArangoDatabase) : TilesQueryByGameAndPosition {

    private val metricId = MetricId.query(TilesQueryByGameAndPosition::class)

    override suspend fun execute(gameId: String, positions: Collection<TilePosition>): List<Tile> {
        return time(metricId) {
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

    private fun strPos(positions: Collection<TilePosition>): String {
        return positions.joinToString(separator = ",") { "{q: ${it.q}, r: ${it.r}}" }.let { "[$it]" }
    }

}