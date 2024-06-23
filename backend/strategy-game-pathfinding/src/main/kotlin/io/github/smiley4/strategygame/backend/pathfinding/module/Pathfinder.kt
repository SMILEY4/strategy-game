package io.github.smiley4.strategygame.backend.pathfinding.module

/**
 * Finds the path from a given starting node to a destination node
 */
internal interface Pathfinder<T : Node> {
    fun find(start: T, end: T): Path<T>
}