package de.ruegnerlukas.strategygame.backend.pathfinding.additionals

import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.common.models.TileType
import de.ruegnerlukas.strategygame.backend.pathfinding.ScoreCalculator
import de.ruegnerlukas.strategygame.backend.common.utils.distance

/**
 * Calculates the score based on the given movement costs (default cost = 1)
 */
class ExtendedScoreCalculator(private val movementCosts: Map<TileType, Float>) : ScoreCalculator<ExtendedNode> {

    override fun f(g: Float, h: Float): Float {
        return g + h
    }

    override fun g(previousNode: ExtendedNode, tile: Tile): Float {
        return previousNode.g + movementCost(previousNode.tile) / 2f + movementCost(tile) / 2f
    }

    override fun h(tile: Tile, destination: Tile): Float {
        return tile.position.distance(destination.position).toFloat()
    }

    private fun movementCost(tile: Tile): Float {
        return movementCosts[tile.data.terrainType] ?: 1f
    }

}