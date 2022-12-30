package de.ruegnerlukas.strategygame.backend.core.pathfinding.basic

import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.Node
import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.ScoreCalculator
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.shared.distance

class BasicScoreCalculator: ScoreCalculator<Node> {

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