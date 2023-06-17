package de.ruegnerlukas.strategygame.backend.core.pathfinding.utils

import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.common.models.TilePosition
import de.ruegnerlukas.strategygame.backend.common.models.TileType

/**
 * The path may only switch from water to land (or from land to water) at specified points
 */
class SwitchFromToWaterViaPointsRule(private val switchingPoints: Collection<TilePosition>) : NextNodeRule<TestNode> {

    override fun evaluate(prev: TestNode, next: TestNode): Boolean {
        if(isLand(prev.tile) && isWater(next.tile)) {
            return isSwitchingPoint(prev.tile)
        }
        if(isWater(prev.tile) && isLand(next.tile)) {
            return isSwitchingPoint(next.tile)
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