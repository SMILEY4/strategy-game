package io.github.smiley4.strategygame.backend.pathfinding.utils

import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.pathfinding.Node

class TestNode(
    val tile: Tile,
    val pathLength: Int,
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
        prevNode = null
    )
}