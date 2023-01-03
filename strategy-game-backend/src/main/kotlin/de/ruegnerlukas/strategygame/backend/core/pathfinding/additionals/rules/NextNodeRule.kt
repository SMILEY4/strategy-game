package de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals.rules

import de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals.ExtendedNode
import de.ruegnerlukas.strategygame.backend.ports.models.Tile

interface NextNodeRule {
    fun evaluate(prev: ExtendedNode, next: Tile): Boolean
}