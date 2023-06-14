package de.ruegnerlukas.strategygame.backend.pathfinding.additionals.rules

import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.pathfinding.additionals.ExtendedNode

interface NextNodeRule {
    /**
     * @return true, if a path from the [prev] location to the [next] location is possible/allowed
     */
    fun evaluate(prev: ExtendedNode, next: Tile): Boolean
}