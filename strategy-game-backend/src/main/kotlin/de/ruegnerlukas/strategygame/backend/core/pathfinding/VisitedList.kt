package de.ruegnerlukas.strategygame.backend.core.pathfinding

import de.ruegnerlukas.strategygame.backend.ports.models.Tile

class VisitedList {

    private val nodes = mutableMapOf<String, PathNode>()

    fun add(node: PathNode) {
        nodes[node.tile.tileId] = node
    }

    fun get(tile: Tile): PathNode? {
        return nodes[tile.tileId]
    }

    fun remove(node: PathNode) {
        nodes.remove(node.tile.tileId)
    }

}