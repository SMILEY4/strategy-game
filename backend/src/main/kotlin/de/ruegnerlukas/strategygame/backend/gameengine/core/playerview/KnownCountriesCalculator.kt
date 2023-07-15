package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileContainer
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.TileDTOVisibility

class KnownCountriesCalculator(private val gameConfig: GameConfig, private val countryId: String) {

    fun getKnownCountries(tiles: TileContainer): Set<String> {
        return (tiles
            .filter { TileVisibilityCalculator(gameConfig, countryId).calculate(it, tiles) != TileDTOVisibility.UNKNOWN }
            .mapNotNull { tile -> tile.owner?.countryId }
                + countryId)
            .toSet()
    }

}