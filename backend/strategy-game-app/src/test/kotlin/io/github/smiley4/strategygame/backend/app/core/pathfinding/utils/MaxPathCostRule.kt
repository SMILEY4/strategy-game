package io.github.smiley4.strategygame.backend.app.core.pathfinding.utils

import io.github.smiley4.strategygame.backend.pathfinding.module.ScoreCalculator


/**
 * The total cost of the path can not be greater than the given max-cost
 */
class MaxPathCostRule(
    private val maxCost: Float,
    private val scoreCalculator: ScoreCalculator<TestNode>
) : NextNodeRule<TestNode> {

    override fun evaluate(prev: TestNode, next: TestNode): Boolean {
        return prev.g + scoreCalculator.g(prev, next) <= maxCost
    }

}