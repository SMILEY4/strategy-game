package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventCityCreate
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventCommandCityCreate
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.ports.models.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStats
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.ReservationInsert
import de.ruegnerlukas.strategygame.backend.shared.RGBColor

/**
 * Creates the new city at the given location and creates new province (if required)
 * - triggered by [GameEventCommandCityCreate]
 * - triggers [GameEventCityCreate]
 */
class GameActionCityCreation(
	private val reservationInsert: ReservationInsert
) : GameAction<GameEventCommandCityCreate>() {

	override suspend fun perform(event: GameEventCommandCityCreate): List<GameEvent> {
		val country = getCountry(event)
		val targetTile = getTargetTile(event)
		val (city, province) = createCity(event.game, country, targetTile, event.command.data)
		return listOf(GameEventCityCreate(event.game, country, province, city))
	}


	private suspend fun createCity(game: GameExtended, country: Country, tile: Tile, data: CreateCityCommandData): Pair<City, Province> {
		return if (shouldCreateNewProvince(data.withNewProvince, tile)) {
			val city = createCity(game, country.countryId, tile, data.name, true)
			val province = addToNewProvince(game, city, country)
			city to province
		} else {
			val city = createCity(game, country.countryId, tile, data.name, false)
			val province = addToExistingProvince(game, city, tile)
			city to province
		}
	}


	private fun shouldCreateNewProvince(withNewProvince: Boolean, targetTile: Tile): Boolean {
		return withNewProvince || targetTile.owner == null
	}


	private suspend fun createCity(game: GameExtended, countryId: String, tile: Tile, name: String, isProvinceCapital: Boolean): City {
		return City(
			cityId = reservationInsert.reserveCity(),
			countryId = countryId,
			tile = TileRef(tile),
			name = name,
			color = RGBColor.random(),
			isProvinceCapital = isProvinceCapital,
			buildings = mutableListOf(),
		).also { game.cities.add(it) }
	}


	private fun addToExistingProvince(game: GameExtended, city: City, targetTile: Tile): Province {
		val provinceId = targetTile.owner?.provinceId ?: throw Exception("No province is owning target tile")
		val province = game.provinces.find { it.provinceId == provinceId } ?: throw Exception("Promise could not be found")
		return province.also { it.cityIds.add(city.cityId) }
	}


	private suspend fun addToNewProvince(game: GameExtended, city: City, country: Country): Province {
		return Province(
			provinceId = reservationInsert.reserveProvince(),
			countryId = country.countryId,
			cityIds = mutableListOf(city.cityId),
			provinceCapitalCityId = city.cityId,
			tradeRoutes = mutableListOf()
		).also { game.provinces.add(it) }
	}


	private fun getTargetTile(event: GameEventCommandCityCreate): Tile {
		return event.game.tiles.get(event.command.data.q, event.command.data.r)!!
	}


	private fun getCountry(event: GameEventCommandCityCreate): Country {
		return event.game.countries.find { it.countryId == event.command.countryId }!!
	}

}