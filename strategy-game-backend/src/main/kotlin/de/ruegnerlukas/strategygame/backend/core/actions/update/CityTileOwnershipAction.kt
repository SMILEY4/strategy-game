package de.ruegnerlukas.strategygame.backend.core.actions.update

import de.ruegnerlukas.strategygame.backend.core.actions.update.CityCreationAction.Companion.CityCreationResult
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TileOwner
import de.ruegnerlukas.strategygame.backend.shared.positionsCircle

/**
 * Re-calculates the owner of the tiles near the created city.
 * This only handles the tiles that will be owned directly by the city, not tiles added to the province via influence
 */
class CityTileOwnershipAction {

    fun perform(game: GameExtended, creationResult: CityCreationResult) {
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