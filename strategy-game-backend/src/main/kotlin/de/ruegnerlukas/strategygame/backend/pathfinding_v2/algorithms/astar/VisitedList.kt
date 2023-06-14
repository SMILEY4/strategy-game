package de.ruegnerlukas.strategygame.backend.pathfinding_v2.algorithms.astar

import de.ruegnerlukas.strategygame.backend.pathfinding_v2.Node

/**
 * List keeping track of visited nodes
 */
class VisitedList<T : Node> {

    private val nodes = mutableMapOf<String, T>()


    /**
     * add the given node to the visited nodes
     */
    fun add(node: T) {
        nodes[node.locationId] = node
    }


    /**
     * @return the node for the given id (or null)
     */
    fun get(nodeId: String): T? {
        return nodes[nodeId]
    }


    /**
     * remove the given node from the visited nodes
     */
    fun remove(node: T) {
        nodes.remove(node.locationId)
    }

}