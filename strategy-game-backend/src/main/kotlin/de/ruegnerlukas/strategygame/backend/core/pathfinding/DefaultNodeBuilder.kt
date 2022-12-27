package de.ruegnerlukas.strategygame.backend.core.pathfinding

import de.ruegnerlukas.strategygame.backend.ports.models.Tile

class DefaultNodeBuilder: NodeBuilder<Node> {

    override fun start(tile: Tile): Node {
        return Node(tile, 0f, 0f, 0f)
    }

    override fun next(prev: Node, next: Tile, score: NodeScore): Node {
        return Node(next, score.f, score.g, score.h, prev)
    }
}