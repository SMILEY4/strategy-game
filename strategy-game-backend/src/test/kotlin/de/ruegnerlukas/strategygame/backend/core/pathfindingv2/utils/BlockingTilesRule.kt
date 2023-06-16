package de.ruegnerlukas.strategygame.backend.core.pathfindingv2.utils

import de.ruegnerlukas.strategygame.backend.common.models.TileType

/**
 * The path may not go through any of the given tile-types
 */
class BlockingTilesRule(private val blockingTiles: Set<TileType>) : NextNodeRule<TestNode> {

    override fun evaluate(prev: TestNode, next: TestNode): Boolean {
        return !blockingTiles.contains(next.tile.data.terrainType)
    }

}