package de.ruegnerlukas.strategygame.backend.pathfinding.additionals.rules

import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.pathfinding.additionals.ExtendedNode

/**
 * The total amount of nodes in the path may not be greater than the given max-value
 */
class MaxPathLengthRule(private val maxLength: Int) : NextNodeRule {

    override fun evaluate(prev: ExtendedNode, next: Tile): Boolean {
        return (prev.pathLength + 1) <= maxLength
    }

}