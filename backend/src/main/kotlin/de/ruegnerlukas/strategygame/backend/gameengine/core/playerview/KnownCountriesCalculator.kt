package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileContainer

class KnownCountriesCalculator(private val dtoCache: POVCache, private val countryId: String) {

    fun getKnownCountries(tiles: TileContainer): Set<String> {
        return (tiles
            .filter { dtoCache.tileVisibility(it.tileId) != VisibilityDTO.UNKNOWN }
            .mapNotNull { tile -> tile.owner?.countryId }
                + countryId)
            .toSet()
    }

}