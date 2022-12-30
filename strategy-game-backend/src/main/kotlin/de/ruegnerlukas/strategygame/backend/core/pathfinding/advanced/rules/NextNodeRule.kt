package de.ruegnerlukas.strategygame.backend.core.pathfinding.advanced.rules

import de.ruegnerlukas.strategygame.backend.core.pathfinding.advanced.AdvancedNode
import de.ruegnerlukas.strategygame.backend.ports.models.Tile

interface NextNodeRule {
    fun evaluate(prev: AdvancedNode, next: Tile): Boolean
}