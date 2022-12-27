package de.ruegnerlukas.strategygame.backend.core.pathfinding

import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import java.util.*

class OpenList<T: Node> {
    
    private val queue = PriorityQueue<T>(Comparator.comparing { it.f })
    private val nodes = mutableMapOf<String, T>()

    fun add(node: T) {
        queue.offer(node)
        nodes[node.tile.tileId] = node
    }

    fun remove(node: T) {
        queue.remove(node)
        nodes.remove(node.tile.tileId)
    }

    fun isNotEmpty(): Boolean {
        return queue.isNotEmpty()
    }

    fun next(): T {
        return queue.poll().also { nodes.remove(it.tile.tileId) }
    }

    fun get(tile: Tile): T? {
        return nodes[tile.tileId]
    }

}