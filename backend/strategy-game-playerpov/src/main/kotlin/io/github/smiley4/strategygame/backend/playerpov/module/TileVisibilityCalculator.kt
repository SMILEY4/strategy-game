package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.utils.distance
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.engine.module.GameConfig

internal class TileVisibilityCalculator {

    fun calculateVisibility(game: GameExtended, povCountryId: String, tile: Tile): TileVisibilityDTO {
        if (!tile.dataPolitical.discoveredByCountries.contains(povCountryId)) {
            return TileVisibilityDTO.UNKNOWN
        }
        if (hasInfluenceVision(povCountryId, tile) || hasLineOfSight(game, povCountryId, tile)) {
            return TileVisibilityDTO.VISIBLE
        }
        return TileVisibilityDTO.DISCOVERED
    }


    private fun hasLineOfSight(game: GameExtended, povCountryId: String, tile: Tile): Boolean {

        val losWorldObject = game.worldObjects
            .asSequence()
            .filter { it.country == povCountryId }
            .any { worldObject -> tile.position.distance(worldObject.tile) <= worldObject.viewDistance }
        if (losWorldObject) {
            return true
        }

        val losSettlement = game.settlements
            .asSequence()
            .filter { it.countryId == povCountryId }
            .any { settlement -> tile.position.distance(settlement.tile) <= settlement.viewDistance }
        if (losSettlement) {
            return true
        }

        return false
    }

    private fun hasInfluenceVision(povCountryId: String, tile: Tile): Boolean {
        val totalInfluence = tile.dataPolitical.influences
            .filter { it.countryId == povCountryId }
            .sumOf { it.amount }
        return totalInfluence >= GameConfig.influenceThresholdVision
    }

}