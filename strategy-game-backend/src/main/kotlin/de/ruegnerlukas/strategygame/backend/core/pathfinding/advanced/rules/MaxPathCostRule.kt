package de.ruegnerlukas.strategygame.backend.core.pathfinding.advanced.rules

import de.ruegnerlukas.strategygame.backend.core.pathfinding.advanced.AdvancedNode
import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.ScoreCalculator
import de.ruegnerlukas.strategygame.backend.ports.models.Tile

/**
 * The total cost of the path can not be greater than the given max-cost
 */
class MaxPathCostRule(
    private val maxCost: Float,
    private val scoreCalculator: ScoreCalculator<AdvancedNode>
) : NextNodeRule {

    override fun evaluate(prev: AdvancedNode, next: Tile): Boolean {
        return prev.g + scoreCalculator.g(prev, next) <= maxCost
    }

}