package de.ruegnerlukas.strategygame.backend.core.pathfinding.core

data class NodeScore(
    val f: Float,
    val g: Float,
    val h: Float
)