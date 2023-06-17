package de.ruegnerlukas.strategygame.backend.pathfinding

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