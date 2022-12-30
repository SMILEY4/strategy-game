package de.ruegnerlukas.strategygame.backend.core.pathfinding.core

data class Path<T : Node>(
    val nodes: List<T>,
) {
    companion object {
        fun <T: Node> empty() = Path<T>(emptyList())
    }
}
