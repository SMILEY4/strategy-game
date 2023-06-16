package de.ruegnerlukas.strategygame.backend.core.pathfindingv2.utils

interface NextNodeRule<T> {
    /**
     * @return true, if a path from the [prev] location to the [next] location is possible/allowed
     */
    fun evaluate(prev: T, next: T): Boolean
}