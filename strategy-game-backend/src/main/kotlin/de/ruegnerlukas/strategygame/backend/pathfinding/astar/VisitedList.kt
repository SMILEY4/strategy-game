package de.ruegnerlukas.strategygame.backend.pathfinding.astar

import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.pathfinding.Node

/**
 * List keeping track of visited nodes
 */
class VisitedList<T : Node> {

    private val nodes = mutableMapOf<String, T>()

    /**
     * add the given node to the visited nodes
     */
    fun add(node: T) {
        nodes[node.tile.tileId] = node
    }

    /**
     * @return the node for the given tile (or null)
     */
    fun get(tile: Tile): T? {
        return nodes[tile.tileId]
    }

    /**
     * remove the given node from the visited nodes
     */
    fun remove(node: T) {
        nodes.remove(node.tile.tileId)
    }

}