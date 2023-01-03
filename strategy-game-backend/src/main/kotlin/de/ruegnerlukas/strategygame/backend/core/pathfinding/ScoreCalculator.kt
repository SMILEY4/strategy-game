package de.ruegnerlukas.strategygame.backend.core.pathfinding

import de.ruegnerlukas.strategygame.backend.ports.models.Tile

/**
 * Calculates the f,g,h-scores for a given tile
 */
interface ScoreCalculator<T : Node> {

    /**
     * @return the total cost of the node (usually g+h)
     */
    fun f(g: Float, h: Float): Float

    /**
     * @return the cost from the start node to the current node/tile
     */
    fun g(previousNode: T, tile: Tile): Float

    /**
     * @return the estimated cost from the current node/tile to the destination.
     * For optimal performance, the estimated cost should always be smaller than (or equal to) the real cost
     */
    fun h(tile: Tile, destination: Tile): Float

}