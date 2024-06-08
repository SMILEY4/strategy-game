package io.github.smiley4.strategygame.backend.pathfinding.algorithms.astar

import io.github.smiley4.strategygame.backend.pathfinding.Node


/**
 * Holds data required for the pathfinding process
 */
class PathfindingContext<T : Node>(
    private val open: OpenList<T> = OpenList(),
    private val visited: VisitedList<T> = VisitedList()
) {

    /**
     * pushes the given node as an open (and visited) node, replacing an already existing (visited) node
     */
    fun pushOpen(node: T) {
        val replaces = visited.get(node.locationId)
        replaces?.also {
            open.remove(it)
            visited.remove(it)
        }
        node.also {
            open.add(it)
            visited.add(it)
        }
    }

    fun hasOpen() = open.isNotEmpty()

    fun getNextOpen() = open

    fun getVisitedGScore(node: T): Float? = visited.get(node.locationId)?.g

}