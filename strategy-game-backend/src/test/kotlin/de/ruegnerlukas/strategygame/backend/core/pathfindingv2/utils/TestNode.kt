package de.ruegnerlukas.strategygame.backend.core.pathfindingv2.utils

import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.pathfinding_v2.Node

class TestNode(
    val tile: Tile,
    val pathLength: Int,
    val visitedProvinces: Set<String>,
    prevNode: Node?
) : Node(
    locationId = "${tile.position.q},${tile.position.r}",
    prevNode = prevNode,
    f = 0f,
    g = 0f,
    h = 0f
)


fun Tile?.node(): TestNode {
    return TestNode(
        tile = this!!,
        pathLength = 1,
        visitedProvinces = this.owner?.provinceId?.let { setOf(it) } ?: setOf(),
        prevNode = null
    )
}