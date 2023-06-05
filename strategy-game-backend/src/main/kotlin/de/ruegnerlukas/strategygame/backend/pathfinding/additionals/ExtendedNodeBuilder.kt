package de.ruegnerlukas.strategygame.backend.pathfinding.additionals

import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.pathfinding.NodeBuilder
import de.ruegnerlukas.strategygame.backend.pathfinding.NodeScore

class ExtendedNodeBuilder : NodeBuilder<ExtendedNode> {

    override fun start(tile: Tile): ExtendedNode {
        return ExtendedNode(
            tile = tile,
            f = 0f,
            g = 0f,
            h = 0f,
            prevNode = null,
            pathLength = 1,
            visitedProvinces = tile.owner?.provinceId?.let { setOf(it) } ?: setOf()
        )
    }

    override fun next(prev: ExtendedNode, tile: Tile, score: NodeScore): ExtendedNode {
        return ExtendedNode(
            tile = tile,
            f = score.f,
            g = score.g,
            h = score.h,
            prevNode = prev,
            pathLength = prev.pathLength + 1,
            visitedProvinces = prev.visitedProvinces + (tile.owner?.provinceId?.let { setOf(it) } ?: setOf())
        )
    }
}