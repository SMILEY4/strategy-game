package de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals

import de.ruegnerlukas.strategygame.backend.core.pathfinding.Node
import de.ruegnerlukas.strategygame.backend.ports.models.Tile

class ExtendedNode(
    tile: Tile,
    f: Float,
    g: Float,
    h: Float,
    prevNode: Node? = null,
    val pathLength: Int,
    val visitedProvinces: Set<String>
) : Node(tile, f, g, h, prevNode)