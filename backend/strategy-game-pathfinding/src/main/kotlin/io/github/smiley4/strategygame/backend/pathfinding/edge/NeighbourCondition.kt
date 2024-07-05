package io.github.smiley4.strategygame.backend.pathfinding.edge

interface NeighbourCondition<T> {
    /**
     * @return true, if a path from the [prev] location to the [next] location is possible/allowed
     */
    fun evaluate(prev: T, next: T): Boolean
}