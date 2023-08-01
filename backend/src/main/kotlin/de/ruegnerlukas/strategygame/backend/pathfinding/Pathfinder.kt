package de.ruegnerlukas.strategygame.backend.pathfinding

/**
 * Finds the path from a given starting node to a destination node
 */
interface Pathfinder<T : Node> {
    fun find(start: T, end: T): Path<T>
}