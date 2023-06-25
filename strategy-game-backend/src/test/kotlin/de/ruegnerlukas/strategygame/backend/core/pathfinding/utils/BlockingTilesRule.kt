package de.ruegnerlukas.strategygame.backend.core.pathfinding.utils

import de.ruegnerlukas.strategygame.backend.common.models.terrain.TerrainType

/**
 * The path may not go through any of the given tile-types
 */
class BlockingTilesRule(private val blockingTiles: Set<TerrainType>) : NextNodeRule<TestNode> {

    override fun evaluate(prev: TestNode, next: TestNode): Boolean {
        return !blockingTiles.contains(next.tile.data.terrainType)
    }

}