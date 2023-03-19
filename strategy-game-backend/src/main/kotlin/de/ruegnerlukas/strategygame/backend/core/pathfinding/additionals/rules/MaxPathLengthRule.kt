package de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals.rules

import de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals.ExtendedNode
import de.ruegnerlukas.strategygame.backend.ports.models.Tile

/**
 * The total amount of nodes in the path may not be greater than the given max-value
 */
class MaxPathLengthRule(private val maxLength: Int) : NextNodeRule {

    override fun evaluate(prev: ExtendedNode, next: Tile): Boolean {
        return (prev.pathLength + 1) <= maxLength
    }

}