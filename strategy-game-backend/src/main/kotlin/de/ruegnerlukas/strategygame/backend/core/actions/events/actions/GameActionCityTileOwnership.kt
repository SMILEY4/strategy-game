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
 * updates the tiles directly owned by a created city
 */
class GameActionCityTileOwnership : GameAction<GameEventCityCreate>(GameEventCityCreate.TYPE) {


    override suspend fun perform(event: GameEventCityCreate): List<GameEvent> {
        val city = getCity(event)
        val province = getProvince(event.game, city.cityId)
        val country = getCountry(event, city)
        positionsCircle(city.tile, 1) { q, r ->
            getTile(event, q, r)?.let { tile ->
                if(canOwnTile(tile, city)) {
                    tile.owner = TileOwner(
                        countryId = country.countryId,
                        provinceId = province.provinceId,
                        cityId = city.cityId
                    )
                }
            }
        }
        return listOf()
    }

    private fun getCity(event: GameEventCityCreate): City {
        return event.game.cities.find { it.cityId == event.createdCityId }!!
    }

    private fun getProvince(game: GameExtended, cityId: String): Province {
        return game.provinces.find { it.cityIds.contains(cityId) }!!
    }

    private fun getCountry(event: GameEventCityCreate, city: City): Country {
        return event.game.countries.find { it.countryId == city.countryId }!!
    }

    private fun getTile(event: GameEventCityCreate, q: Int, r: Int): Tile? {
        return event.game.tiles.find { it.position.q == q && it.position.r == r }
    }

    private fun canOwnTile(tile: Tile, city: City): Boolean {
        return tile.owner == null || (tile.owner?.countryId == city.countryId && tile.owner?.cityId == null)
    }

}