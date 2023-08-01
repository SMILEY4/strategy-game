package de.ruegnerlukas.strategygame.backend.core.pathfinding.utils

import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.pathfinding.Node

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