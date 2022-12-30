package de.ruegnerlukas.strategygame.backend.core.pathfinding.advanced

import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.Node
import de.ruegnerlukas.strategygame.backend.ports.models.Tile

class AdvancedNode(
    tile: Tile,
    f: Float,
    g: Float,
    h: Float,
    prevNode: Node? = null,
    val pathLength: Int,
    val visitedProvinces: Set<String>
) : Node(tile, f, g, h, prevNode)