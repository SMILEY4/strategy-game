package de.ruegnerlukas.strategygame.backend.core.pathfinding.advanced.rules

import de.ruegnerlukas.strategygame.backend.core.pathfinding.advanced.AdvancedNode
import de.ruegnerlukas.strategygame.backend.ports.models.Tile

/**
 * The total amount of nodes in the path may not be greater than the given max-value
 */
class MaxPathLengthRule(private val maxLength: Int) : NextNodeRule {

    override fun evaluate(prev: AdvancedNode, next: Tile): Boolean {
        return (prev.pathLength + 1) <= maxLength
    }

}