package io.github.smiley4.strategygame.backend.app.core.pathfinding.utils

import io.github.smiley4.strategygame.backend.common.models.terrain.TerrainType


/**
 * The path may not go through any of the given tile-types
 */
class BlockingTilesRule(private val blockingTiles: Set<TerrainType>) : NextNodeRule<TestNode> {

    override fun evaluate(prev: TestNode, next: TestNode): Boolean {
        return !blockingTiles.contains(next.tile.data.terrainType)
    }

}