package io.github.smiley4.strategygame.backend.pathfinding.module

/**
 * Result of a pathfinding process
 */
internal data class Path<T : Node>(val nodes: Collection<T>) {
    companion object {
        fun <T : Node> empty() = Path<T>(emptyList())
    }
}
