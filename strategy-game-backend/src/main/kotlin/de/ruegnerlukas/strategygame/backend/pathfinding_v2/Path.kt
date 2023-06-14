package de.ruegnerlukas.strategygame.backend.pathfinding_v2

/**
 * Result of a pathfinding process
 */
data class Path<T : Node>(val nodes: List<T>) {
    companion object {
        fun <T : Node> empty() = Path<T>(emptyList())
    }
}
