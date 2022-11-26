package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEventType
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.CreateCityCommandEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.CreateCityEvent
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.ReservationInsert
import de.ruegnerlukas.strategygame.backend.shared.RGBColor

class CityCreationAction(private val reservationInsert: ReservationInsert) : GameAction<CreateCityCommandEvent>() {

    override suspend fun triggeredBy(): List<GameEventType> {
        return listOf(CreateCityCommandEvent::class.simpleName!!)
    }


    override suspend fun perform(event: CreateCityCommandEvent): List<GameEvent> {
        val targetTile = getTargetTile(event)
        val country = getCountry(event)

        val cityId: String
        val provinceId: String
        if (shouldCreateNewProvince(event, targetTile)) {
            cityId = createCity(event.game, country.countryId, targetTile, event.command.data.name, true)
            provinceId = createProvince(event.game, country.countryId, cityId)
        } else {
            cityId = createCity(event.game, country.countryId, targetTile, event.command.data.name, false)
            provinceId = targetTile.owner?.provinceId ?: throw Exception("No province is owning target tile")
            event.game.provinces.find { it.provinceId == provinceId }?.cityIds?.add(cityId)
        }
        return listOf(CreateCityEvent(event.game, cityId))
    }

    private fun getTargetTile(event: CreateCityCommandEvent): Tile {
        return event.game.tiles.find { it.position.q == event.command.data.q && it.position.r == event.command.data.r }!!
    }

    private fun getCountry(event: CreateCityCommandEvent): Country {
        return event.game.countries.find { it.countryId == event.command.countryId }!!
    }

    private fun shouldCreateNewProvince(event: CreateCityCommandEvent, targetTile: Tile): Boolean {
        return event.command.data.withNewProvince || targetTile.owner == null
    }

    private suspend fun createProvince(game: GameExtended, countryId: String, provinceCapitalCityId: String): String {
        return Province(
            provinceId = reservationInsert.reserveProvince(),
            countryId = countryId,
            cityIds = mutableListOf(provinceCapitalCityId),
            provinceCapitalCityId = provinceCapitalCityId,
        ).also { game.provinces.add(it) }.provinceId
    }

    private suspend fun createCity(game: GameExtended, countryId: String, tile: Tile, name: String, isProvinceCapital: Boolean): String {
        return City(
            cityId = reservationInsert.reserveCity(),
            countryId = countryId,
            tile = TileRef(tile.tileId, tile.position.q, tile.position.r),
            name = name,
            color = RGBColor.random(),
            isProvinceCapital = isProvinceCapital,
            buildings = mutableListOf(),
        ).also { game.cities.add(it) }.cityId
    }


}