package de.ruegnerlukas.strategygame.backend.pathfinding.algorithms.astar

import de.ruegnerlukas.strategygame.backend.pathfinding.Node
import java.util.*

/**
 * List of open nodes, sorted by f-score
 */
class OpenList<T : Node> {

    private val queue = PriorityQueue<T>(Comparator.comparing { it.f })
    private val nodes = mutableMapOf<String, T>()

    /**
     * add the given node to the open nodes
     */
    fun add(node: T) {
        queue.offer(node)
        nodes[node.locationId] = node
    }

    /**
     * remove the given node from the open nodes
     */
    fun remove(node: T) {
        queue.remove(node)
        nodes.remove(node.locationId)
    }

    /**
     * @return whether there are open nodes (i.e. list is not empty)
     */
    fun isNotEmpty(): Boolean {
        return queue.isNotEmpty()
    }

    /**
     * @return the node with the smallest f-score and removes it from the list
     */
    fun next(): T {
        return queue.poll().also { nodes.remove(it.locationId) }
    }

    /**
     * @return the node for the given id (or null)
     */
    fun get(nodeId: String): T? {
        return nodes[nodeId]
    }

}