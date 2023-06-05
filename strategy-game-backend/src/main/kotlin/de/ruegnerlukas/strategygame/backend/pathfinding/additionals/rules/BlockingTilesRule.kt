package de.ruegnerlukas.strategygame.backend.pathfinding.additionals.rules

import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.common.models.TileType
import de.ruegnerlukas.strategygame.backend.pathfinding.additionals.ExtendedNode

/**
 * The path may not go through any of the given tile-types
 */
class BlockingTilesRule(private val blockingTiles: Set<TileType>) : NextNodeRule {

    override fun evaluate(prev: ExtendedNode, next: Tile): Boolean {
        return !blockingTiles.contains(next.data.terrainType)
    }

}