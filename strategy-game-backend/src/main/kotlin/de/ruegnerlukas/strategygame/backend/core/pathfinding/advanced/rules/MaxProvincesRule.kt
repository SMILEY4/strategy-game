package de.ruegnerlukas.strategygame.backend.core.pathfinding.advanced.rules

import de.ruegnerlukas.strategygame.backend.core.pathfinding.advanced.AdvancedNode
import de.ruegnerlukas.strategygame.backend.ports.models.Tile

/**
 * The path can not cross more than the given max amount of different provinces (Unclaimed tiles are not counted)
 */
class MaxProvincesRule(private val maxProvinces: Int) : NextNodeRule {

    override fun evaluate(prev: AdvancedNode, next: Tile): Boolean {
        val enterNewProvince = next.owner?.provinceId
            ?.let { !prev.visitedProvinces.contains(it) }
            ?: false
        return if(enterNewProvince) {
            prev.visitedProvinces.size+1 <= maxProvinces
        } else {
            true
        }
    }

}