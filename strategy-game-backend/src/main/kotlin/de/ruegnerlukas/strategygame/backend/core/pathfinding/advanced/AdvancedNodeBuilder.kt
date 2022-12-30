package de.ruegnerlukas.strategygame.backend.core.pathfinding.advanced

import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.NodeBuilder
import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.NodeScore
import de.ruegnerlukas.strategygame.backend.ports.models.Tile

class AdvancedNodeBuilder : NodeBuilder<AdvancedNode> {

    override fun start(tile: Tile): AdvancedNode {
        return AdvancedNode(
            tile = tile,
            f = 0f,
            g = 0f,
            h = 0f,
            prevNode = null,
            pathLength = 1,
            visitedProvinces = tile.owner?.provinceId?.let { setOf(it) } ?: setOf()
        )
    }

    override fun next(prev: AdvancedNode, next: Tile, score: NodeScore): AdvancedNode {
        return AdvancedNode(
            tile = next,
            f = score.f,
            g = score.g,
            h = score.h,
            prevNode = prev,
            pathLength = prev.pathLength + 1,
            visitedProvinces = prev.visitedProvinces + (next.owner?.provinceId?.let { setOf(it) } ?: setOf())
        )
    }
}