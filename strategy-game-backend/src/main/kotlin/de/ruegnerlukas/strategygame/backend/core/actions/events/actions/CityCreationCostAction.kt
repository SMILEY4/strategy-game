package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEventType
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.CreateCityEvent
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Country

/**
 * Handles the cost of building a city
 */
class CityCreationCostAction(private val gameConfig: GameConfig) : GameAction<CreateCityEvent>() {


    override suspend fun triggeredBy(): List<GameEventType> {
        return listOf(CreateCityEvent::class.simpleName!!)
    }


    override suspend fun perform(event: CreateCityEvent): List<GameEvent> {
        val city = getCity(event)
        val country = getCountry(event, city)
        removeCityFoundingCost(country, city)
        return listOf()
    }

    private fun getCity(event: CreateCityEvent): City {
        return event.game.cities.find { it.cityId == event.createdCityId }!!
    }

    private fun getCountry(event: CreateCityEvent, city: City): Country {
        return event.game.countries.find { it.countryId == city.countryId }!!
    }

    private fun removeCityFoundingCost(country: Country, city: City) {
        country.resources.money -= if(city.isProvinceCapital) gameConfig.cityCostMoney else gameConfig.townCostMoney
    }


}