package de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals.rules

import de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals.ExtendedNode
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.TileType

/**
 * The path may only switch from water to land (or from land to water) at specified points
 */
class SwitchFromToWaterViaPointsRule(private val switchingPoints: Collection<TilePosition>) : NextNodeRule {

    override fun evaluate(prev: ExtendedNode, next: Tile): Boolean {
        if(isLand(prev.tile) && isWater(next)) {
            return isSwitchingPoint(prev.tile)
        }
        if(isWater(prev.tile) && isLand(next)) {
            return isSwitchingPoint(next)
        }
        return true
    }

    private fun isWater(tile: Tile): Boolean {
        return tile.data.terrainType == TileType.WATER
    }

    private fun isLand(tile: Tile): Boolean {
        return tile.data.terrainType != TileType.WATER
    }

    private fun isSwitchingPoint(tile: Tile): Boolean {
        return switchingPoints.contains(tile.position)
    }

}