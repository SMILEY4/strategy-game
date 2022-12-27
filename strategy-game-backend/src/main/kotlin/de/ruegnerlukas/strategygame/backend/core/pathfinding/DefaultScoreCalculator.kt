package de.ruegnerlukas.strategygame.backend.core.pathfinding

import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.shared.distance

class DefaultScoreCalculator: ScoreCalculator<Node> {

    override fun f(g: Float, h: Float): Float {
        return g + h
    }

    override fun g(from: Node, to: Tile): Float {
        return from.g + 1f
    }

    override fun h(from: Tile, destination: Tile): Float {
        return from.position.distance(destination.position).toFloat()
    }
}