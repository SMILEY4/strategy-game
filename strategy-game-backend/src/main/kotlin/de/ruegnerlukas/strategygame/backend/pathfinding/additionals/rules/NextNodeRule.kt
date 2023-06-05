package de.ruegnerlukas.strategygame.backend.pathfinding.additionals.rules

import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.pathfinding.additionals.ExtendedNode

interface NextNodeRule {
    fun evaluate(prev: ExtendedNode, next: Tile): Boolean
}