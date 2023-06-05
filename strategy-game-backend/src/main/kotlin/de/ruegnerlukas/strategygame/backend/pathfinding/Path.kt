package de.ruegnerlukas.strategygame.backend.pathfinding

/**
 * Result of a pathfinding process
 */
data class Path<T : Node>(val nodes: List<T>) {
    companion object {
        /**
         * @return an empty path
         */
        fun <T : Node> empty() = Path<T>(emptyList())
    }
}
