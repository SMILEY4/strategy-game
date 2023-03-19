package de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals.rules

import de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals.ExtendedNode
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TileType

/**
 * The path may not go through any of the given tile-types
 */
class BlockingTilesRule(private val blockingTiles: Set<TileType>) : NextNodeRule {

    override fun evaluate(prev: ExtendedNode, next: Tile): Boolean {
        return !blockingTiles.contains(next.data.terrainType)
    }

}