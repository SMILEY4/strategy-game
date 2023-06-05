package de.ruegnerlukas.strategygame.backend.gameengine.core.update

import de.ruegnerlukas.strategygame.backend.common.Logging
import de.ruegnerlukas.strategygame.backend.common.models.Country
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.models.Tile

/**
 * Uncovers/Discovers tiles after a change in influence
 */
class InfluenceVisibilityAction: Logging {

    fun perform(game: GameExtended, tiles: Collection<Tile>) {
        log().debug("Update visibility of ${tiles.size} tiles after changed influence")
        tiles.forEach { tile ->
            updateTile(game, tile)
        }
    }

    private fun updateTile(game: GameExtended, tile: Tile) {
        game.countries.forEach { country ->
            if (canDiscover(tile, country)) {
                discoverTile(tile, country)
            }
        }
    }

    private fun canDiscover(tile: Tile, country: Country): Boolean {
        return !hasDiscovered(country, tile) && (isOwner(country, tile) || hasInfluence(country.countryId, tile))
    }

    private fun hasDiscovered(country: Country, tile: Tile): Boolean {
        return tile.discoveredByCountries.contains(country.countryId)
    }

    private fun isOwner(country: Country, tile: Tile): Boolean {
        return tile.owner?.countryId == country.countryId
    }

    private fun hasInfluence(countryId: String, tile: Tile): Boolean {
        return tile.influences.any { it.countryId == countryId }
    }

    private fun discoverTile(tile: Tile, country: Country) {
        tile.discoveredByCountries.add(country.countryId)
    }

}