package de.ruegnerlukas.strategygame.backend.pathfinding.additionals

import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.pathfinding.Node

class ExtendedNode(
    tile: Tile,
    f: Float,
    g: Float,
    h: Float,
    prevNode: Node? = null,
    val pathLength: Int,
    val visitedProvinces: Set<String>
) : Node(tile, f, g, h, prevNode)