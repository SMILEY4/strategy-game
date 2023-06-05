package de.ruegnerlukas.strategygame.backend.pathfinding.additionals

import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.pathfinding.Node
import de.ruegnerlukas.strategygame.backend.pathfinding.NodeBuilder
import de.ruegnerlukas.strategygame.backend.pathfinding.NodeScore

class BasicNodeBuilder: NodeBuilder<Node> {

    override fun start(tile: Tile): Node {
        return Node(tile, 0f, 0f, 0f)
    }

    override fun next(prev: Node, tile: Tile, score: NodeScore): Node {
        return Node(tile, score.f, score.g, score.h, prev)
    }
}