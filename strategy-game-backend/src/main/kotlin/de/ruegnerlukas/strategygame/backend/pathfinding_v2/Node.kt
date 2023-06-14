package de.ruegnerlukas.strategygame.backend.pathfinding_v2

/**
 * Base node
 */
open class Node(
    val locationId: String,
    val prevNode: Node? = null,
    var f: Float,
    var g: Float,
    var h: Float,
)