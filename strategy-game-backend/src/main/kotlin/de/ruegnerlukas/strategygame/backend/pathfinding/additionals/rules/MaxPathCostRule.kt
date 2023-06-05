package de.ruegnerlukas.strategygame.backend.pathfinding.additionals.rules

import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.pathfinding.ScoreCalculator
import de.ruegnerlukas.strategygame.backend.pathfinding.additionals.ExtendedNode

/**
 * The total cost of the path can not be greater than the given max-cost
 */
class MaxPathCostRule(
    private val maxCost: Float,
    private val scoreCalculator: ScoreCalculator<ExtendedNode>
) : NextNodeRule {

    override fun evaluate(prev: ExtendedNode, next: Tile): Boolean {
        return prev.g + scoreCalculator.g(prev, next) <= maxCost
    }

}