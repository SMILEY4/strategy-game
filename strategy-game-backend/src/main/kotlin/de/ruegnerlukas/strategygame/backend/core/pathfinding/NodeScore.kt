package de.ruegnerlukas.strategygame.backend.core.pathfinding

data class NodeScore(
    val f: Float,
    val g: Float,
    val h: Float
)