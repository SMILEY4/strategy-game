package de.ruegnerlukas.strategygame.backend.core.pathfinding.astar

import de.ruegnerlukas.strategygame.backend.core.pathfinding.Node

/**
 * Holds data required for the pathfinding process
 */
class AStarPathfindingContext<T : Node>(
    val open: OpenList<T>,
    val visited: VisitedList<T>
) {

    /**
     * pushes the given node as an open (and visited) node, optionally replacing an already existing node
     */
    fun pushOpen(node: T, replaces: T? = null) {
        replaces?.also {
            open.remove(it)
            visited.remove(it)
        }
        node.also {
            open.add(it)
            visited.add(it)
        }
    }

}