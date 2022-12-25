package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventCityCreate
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
 * - triggered by [GameEventCityCreate]
 * - triggers nothing
 */
class GameActionCityTileOwnership : GameAction<GameEventCityCreate>(GameEventCityCreate.TYPE) {

    override suspend fun perform(event: GameEventCityCreate): List<GameEvent> {
        val country = getCountry(event)
        val province = getProvince(event)
        val city = getCity(event)
        positionsCircle(city.tile, 1) { q, r ->
            getTile(event, q, r)?.let { tile ->
                if(canOwnTile(tile, city)) {
                    setTileOwner(tile, country, province, city)
                }
            }
        }
        return listOf()
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


    private fun getTile(event: GameEventCityCreate, q: Int, r: Int): Tile? {
        return event.game.tiles.get(q, r)
    }


    private fun getCity(event: GameEventCityCreate): City {
        return event.city
    }


    private fun getProvince(event: GameEventCityCreate): Province {
        return event.province
    }


    private fun getCountry(event: GameEventCityCreate): Country {
        return event.country
    }

}