package de.ruegnerlukas.strategygame.backend.core.pathfinding.core.astar

import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.Node
import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.OpenList
import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.VisitedList

class PathfindingContext<T : Node>(
    val open: OpenList<T>,
    val visited: VisitedList<T>
) {

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