package io.github.smiley4.strategygame.backend.pathfinding.module

/**
 * Base node
 */
internal open class Node(
    val locationId: String,
    val prevNode: Node? = null,
    var f: Float,
    var g: Float,
    var h: Float,
)