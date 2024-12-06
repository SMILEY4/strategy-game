package io.github.smiley4.strategygame.backend.pathfinding

/**
 * Base node
 */
open class Node(
    val locationId: String,
    val prevNode: Node? = null,
    var f: Float = 0f,
    var g: Float = 0f,
    var h: Float = 0f,
)