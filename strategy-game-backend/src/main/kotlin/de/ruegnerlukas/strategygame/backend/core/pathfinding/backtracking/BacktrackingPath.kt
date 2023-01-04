package de.ruegnerlukas.strategygame.backend.core.pathfinding.backtracking

import de.ruegnerlukas.strategygame.backend.core.pathfinding.Node

/**
 * Custom path for the [BacktrackingPathfinder]
 */
data class BacktrackingPath<T : Node>(
    val nodes: List<T>,
    val tileIds: Set<String>,
    val f: Float,
) {

    companion object {

        /**
         * @return a new path with the given nodes
         */
        fun <T : Node> of(nodes: List<T>): BacktrackingPath<T> {
            return BacktrackingPath(
                nodes,
                nodes.asSequence().map { it.tile.tileId }.toSet(),
                nodes.lastOrNull()?.f ?: 0f
            )
        }

        /**
         * @return a new path combining the given path with the given node
         */
        fun <T : Node> of(path: BacktrackingPath<T>, node: T): BacktrackingPath<T> {
            return BacktrackingPath(
                path.nodes + node,
                path.tileIds + node.tile.tileId,
                node.f
            )
        }
    }
}