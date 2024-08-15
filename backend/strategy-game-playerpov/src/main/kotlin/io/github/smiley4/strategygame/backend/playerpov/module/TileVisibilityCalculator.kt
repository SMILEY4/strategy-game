package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.utils.distance
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Tile

internal class TileVisibilityCalculator {

    fun calculateVisibility(game: GameExtended, povCountryId: String, tile: Tile): TileVisibilityDTO {
        if (!tile.dataPolitical.discoveredByCountries.contains(povCountryId)) {
            return TileVisibilityDTO.UNKNOWN
        }
        if (hasLineOfSight(game, povCountryId, tile)) {
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

}