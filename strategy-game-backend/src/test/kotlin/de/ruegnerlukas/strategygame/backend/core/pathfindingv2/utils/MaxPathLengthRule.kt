package de.ruegnerlukas.strategygame.backend.core.pathfindingv2.utils

/**
 * The total amount of nodes in the path may not be greater than the given max-value
 */
class MaxPathLengthRule(private val maxLength: Int) : NextNodeRule<TestNode> {

    override fun evaluate(prev: TestNode, next: TestNode): Boolean {
        return (prev.pathLength + 1) <= maxLength
    }

}