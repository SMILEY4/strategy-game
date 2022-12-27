package de.ruegnerlukas.strategygame.backend.core.pathfinding

import de.ruegnerlukas.strategygame.backend.ports.models.Tile

class VisitedList<T: Node> {

    private val nodes = mutableMapOf<String, T>()

    fun add(node: T) {
        nodes[node.tile.tileId] = node
    }

    fun get(tile: Tile): T? {
        return nodes[tile.tileId]
    }

    fun remove(node: T) {
        nodes.remove(node.tile.tileId)
    }
    
}