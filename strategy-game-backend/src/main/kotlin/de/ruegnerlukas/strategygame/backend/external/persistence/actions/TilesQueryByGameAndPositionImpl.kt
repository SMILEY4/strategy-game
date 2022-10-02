package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.TilesQueryByGameAndPosition
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase

class TilesQueryByGameAndPositionImpl(private val database: ArangoDatabase) : TilesQueryByGameAndPosition {

    override suspend fun execute(gameId: String, positions: List<TilePosition>): List<TileEntity> {
        database.assertCollections(Collections.TILES)
        return database.query(
            """
                FOR tile IN ${Collections.TILES}
                    FILTER tile.gameId == @gameId
                    FILTER CONTAINS_ARRAY(${strPos(positions)}, tile.position)
                    RETURN tile
			""".trimIndent(),
            mapOf("gameId" to gameId),
            TileEntity::class.java
        )
    }

    private fun strPos(positions: List<TilePosition>): String {
        return positions.joinToString(separator = ",") { "{q: ${it.q}, r: ${it.r}}" }.let { "[$it]" }
    }

}