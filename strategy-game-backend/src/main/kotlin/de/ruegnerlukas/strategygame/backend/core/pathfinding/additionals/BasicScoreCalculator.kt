package de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals

import de.ruegnerlukas.strategygame.backend.core.pathfinding.Node
import de.ruegnerlukas.strategygame.backend.core.pathfinding.ScoreCalculator
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.shared.distance

class BasicScoreCalculator: ScoreCalculator<Node> {

    override fun f(g: Float, h: Float): Float {
        return g + h
    }

    override fun g(previousNode: Node, tile: Tile): Float {
        return previousNode.g + 1f
    }

    override fun h(tile: Tile, destination: Tile): Float {
        return tile.position.distance(destination.position).toFloat()
    }
}