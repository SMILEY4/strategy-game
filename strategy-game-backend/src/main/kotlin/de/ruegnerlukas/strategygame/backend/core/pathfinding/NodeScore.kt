package de.ruegnerlukas.strategygame.backend.core.pathfinding

/**
 * holds the f,g,h-scores for a single node
 */
data class NodeScore(
    val f: Float,
    val g: Float,
    val h: Float
)