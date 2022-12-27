package de.ruegnerlukas.strategygame.backend.core.pathfinding

import de.ruegnerlukas.strategygame.backend.ports.models.Tile

data class PathNode(
    val tile: Tile,
    val f: Float,
    val g: Float,
    val h: Float,
    val prevNode: PathNode? = null
)