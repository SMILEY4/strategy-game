package de.ruegnerlukas.strategygame.backend.core.pathfinding.basic

import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.Node
import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.NodeBuilder
import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.NodeScore
import de.ruegnerlukas.strategygame.backend.ports.models.Tile

class BasicNodeBuilder: NodeBuilder<Node> {

    override fun start(tile: Tile): Node {
        return Node(tile, 0f, 0f, 0f)
    }

    override fun next(prev: Node, next: Tile, score: NodeScore): Node {
        return Node(next, score.f, score.g, score.h, prev)
    }
}