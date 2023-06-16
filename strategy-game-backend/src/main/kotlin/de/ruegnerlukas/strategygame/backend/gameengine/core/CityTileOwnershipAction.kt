package de.ruegnerlukas.strategygame.backend.gameengine.core

import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.City
import de.ruegnerlukas.strategygame.backend.common.models.Country
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.models.Province
import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.common.models.TileOwner
import de.ruegnerlukas.strategygame.backend.common.utils.positionsCircle

/**
 * Re-calculates the owner of the tiles near the created city.
 * This only handles the tiles that will be owned directly by the city, not tiles added to the province via influence
 */
class CityTileOwnershipAction: Logging {

    fun perform(game: GameExtended, creationResult: CityCreationAction.Companion.CityCreationResult) {
        log().debug("Update tile owners after creation of city ${creationResult.city.cityId}")
        val country = creationResult.country
        val province = creationResult.province
        val city = creationResult.city
        positionsCircle(city.tile, 1) { q, r ->
            getTile(game, q, r)?.let { tile ->
                if (canOwnTile(tile, city)) {
                    setTileOwner(tile, country, province, city)
                }
            }
        }
    }

    private fun canOwnTile(tile: Tile, city: City): Boolean {
        return tile.owner == null || (tile.owner?.countryId == city.countryId && tile.owner?.cityId == null)
    }

    private fun setTileOwner(tile: Tile, country: Country, province: Province, city: City) {
        tile.owner = TileOwner(
            countryId = country.countryId,
            provinceId = province.provinceId,
            cityId = city.cityId
        )
    }

    private fun getTile(game: GameExtended, q: Int, r: Int): Tile? {
        return game.tiles.get(q, r)
    }

}