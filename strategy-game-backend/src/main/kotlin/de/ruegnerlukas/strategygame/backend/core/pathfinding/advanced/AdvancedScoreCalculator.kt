package de.ruegnerlukas.strategygame.backend.core.pathfinding.advanced

import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.ScoreCalculator
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TileType
import de.ruegnerlukas.strategygame.backend.shared.distance

/**
 * Calculates the score based on the given movement costs (default cost = 1)
 */
class AdvancedScoreCalculator(private val movementCosts: Map<TileType, Float>) : ScoreCalculator<AdvancedNode> {

    override fun f(g: Float, h: Float): Float {
        return g + h
    }

    override fun g(from: AdvancedNode, to: Tile): Float {
        return from.g + movementCost(from.tile) / 2f + movementCost(to) / 2f
    }

    override fun h(from: Tile, destination: Tile): Float {
        return from.position.distance(destination.position).toFloat()
    }

    private fun movementCost(tile: Tile): Float {
        return movementCosts[tile.data.terrainType] ?: 1f
    }

}