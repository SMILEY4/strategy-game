package de.ruegnerlukas.strategygame.backend.core.pathfinding

import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import java.util.*

class OpenList {

    private val queue = PriorityQueue<PathNode>(Comparator.comparing { it.f })
    private val nodes = mutableMapOf<String, PathNode>()

    fun add(node: PathNode) {
        queue.offer(node)
        nodes[node.tile.tileId] = node
    }

    fun remove(node: PathNode) {
        queue.remove(node)
        nodes.remove(node.tile.tileId)
    }

    fun isNotEmpty(): Boolean {
        return queue.isNotEmpty()
    }

    fun next(): PathNode {
        return queue.poll().also { nodes.remove(it.tile.tileId) }
    }

    fun get(tile: Tile): PathNode? {
        return nodes[tile.tileId]
    }

}