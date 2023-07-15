package de.ruegnerlukas.strategygame.backend.pathfinding.algorithms.backtracking

import de.ruegnerlukas.strategygame.backend.pathfinding.Node
import de.ruegnerlukas.strategygame.backend.pathfinding.Path


/**
 * Custom path for the [BacktrackingPathfinder]
 */
data class BacktrackingPath<T : Node>(
    val nodes: List<T>,
    val nodeIds: Set<String>,
    val f: Float,
) {

    companion object {

        /**
         * @return a new path with the given nodes
         */
        fun <T : Node> of(vararg nodes: T): BacktrackingPath<T> {
            return of(nodes.toList())
        }


        /**
         * @return a new path with the given nodes
         */
        fun <T : Node> of(nodes: List<T>): BacktrackingPath<T> {
            return BacktrackingPath(
                nodes,
                nodes.asSequence().map { it.locationId }.toSet(),
                nodes.lastOrNull()?.f ?: 0f
            )
        }


        /**
         * @return a new path combining the given path with the given node
         */
        fun <T : Node> of(path: BacktrackingPath<T>, node: T): BacktrackingPath<T> {
            return BacktrackingPath(
                path.nodes + node,
                path.nodeIds + node.locationId,
                node.f
            )
        }
    }

    fun asPath() = Path(this.nodes)
}