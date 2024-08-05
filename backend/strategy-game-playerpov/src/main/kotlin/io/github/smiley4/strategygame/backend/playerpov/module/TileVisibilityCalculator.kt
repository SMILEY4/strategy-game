package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.utils.distance
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.ScoutWorldObject
import io.github.smiley4.strategygame.backend.commondata.Tile

internal class TileVisibilityCalculator {

    fun calculateVisibility(game: GameExtended, povCountryId: String, tile: Tile): TileVisibilityDTO {
        if (!tile.discoveredByCountries.contains(povCountryId)) {
            return TileVisibilityDTO.UNKNOWN
        }
        if(hasLineOfSight(game, povCountryId, tile)) {
            return TileVisibilityDTO.VISIBLE
        }
        return TileVisibilityDTO.DISCOVERED
    }

    private fun hasLineOfSight(game: GameExtended, povCountryId: String, tile: Tile): Boolean {
        return game.worldObjects
            .asSequence()
            .filterIsInstance<ScoutWorldObject>()
            .filter { it.country == povCountryId }
            .any { scout -> tile.position.distance(scout.tile) <= scout.viewDistance }
    }

}