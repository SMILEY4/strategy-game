package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.utils.positionsCircle
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.ScoutTileObject
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileContainer
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.TileDTOVisibility

class TileVisibilityCalculator(private val gameConfig: GameConfig, private val countryId: String) {

    fun calculate(tile: Tile, tiles: TileContainer): TileDTOVisibility {
        if (tile.discoveredByCountries.contains(countryId)) {
            val scoutNearby = positionsCircle(tile.position, gameConfig.scoutVisibilityRange)
                .asSequence()
                .mapNotNull { pos -> tiles.get(pos) }
                .mapNotNull { t -> t.objects.find { it is ScoutTileObject }?.let { it as ScoutTileObject } }
                .any { it.countryId == countryId }
            if (scoutNearby) {
                return TileDTOVisibility.VISIBLE
            }
            val hasInfluence = tile.influences.any { it.countryId == countryId }
            val foreignOwner = tile.owner != null && tile.owner?.countryId != countryId
            return if (hasInfluence && !foreignOwner) {
                TileDTOVisibility.VISIBLE
            } else {
                TileDTOVisibility.DISCOVERED
            }
        } else {
            return TileDTOVisibility.UNKNOWN
        }
    }

}