package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventCityCreate
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Country

/**
 * Handles the cost of building a city
 */
class GameActionCityCreationCost(
    private val gameConfig: GameConfig
) : GameAction<GameEventCityCreate>(GameEventCityCreate.TYPE) {

    override suspend fun perform(event: GameEventCityCreate): List<GameEvent> {
        val city = getCity(event)
        val country = getCountry(event, city)
        removeCityFoundingCost(country, city)
        return listOf()
    }

    private fun getCity(event: GameEventCityCreate): City {
        return event.game.cities.find { it.cityId == event.createdCityId }!!
    }

    private fun getCountry(event: GameEventCityCreate, city: City): Country {
        return event.game.countries.find { it.countryId == city.countryId }!!
    }

    private fun removeCityFoundingCost(country: Country, city: City) {
        country.resources.money -= if (city.isProvinceCapital) gameConfig.cityCostMoney else gameConfig.townCostMoney
    }


}