package de.ruegnerlukas.strategygame.backend.pathfinding_v2

interface TargetReachedCondition<T: Node> {
    /**
     * @return true, if the given node is the target node
     */
    fun check(node: T): Boolean
}