package de.ruegnerlukas.strategygame.backend.core.pathfinding

import de.ruegnerlukas.strategygame.backend.ports.models.Tile

/**
 * Base node
 */
open class Node(
    val tile: Tile,
    val f: Float,
    val g: Float,
    val h: Float,
    val prevNode: Node? = null
)