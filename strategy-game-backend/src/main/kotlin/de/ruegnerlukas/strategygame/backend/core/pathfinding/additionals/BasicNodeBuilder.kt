package de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals

import de.ruegnerlukas.strategygame.backend.core.pathfinding.Node
import de.ruegnerlukas.strategygame.backend.core.pathfinding.NodeBuilder
import de.ruegnerlukas.strategygame.backend.core.pathfinding.NodeScore
import de.ruegnerlukas.strategygame.backend.ports.models.Tile

class BasicNodeBuilder: NodeBuilder<Node> {

    override fun start(tile: Tile): Node {
        return Node(tile, 0f, 0f, 0f)
    }

    override fun next(prev: Node, tile: Tile, score: NodeScore): Node {
        return Node(tile, score.f, score.g, score.h, prev)
    }
}