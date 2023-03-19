package de.ruegnerlukas.strategygame.backend.core.pathfinding

/**
 * holds the f,g,h-scores for a single node
 */
data class NodeScore(
    /**
     * the total cost of the node (usually g+h)
     */
    val f: Float,
    /**
     * the cost from the start node to the current node/tile
     */
    val g: Float,
    /**
     * the estimated cost from the current node/tile to the destination.
     */
    val h: Float
)