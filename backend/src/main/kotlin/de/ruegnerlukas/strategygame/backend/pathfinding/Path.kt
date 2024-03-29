package de.ruegnerlukas.strategygame.backend.pathfinding

/**
 * Result of a pathfinding process
 */
data class Path<T : Node>(val nodes: Collection<T>) {
    companion object {
        fun <T : Node> empty() = Path<T>(emptyList())
    }
}
