package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventCityCreate
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Country

/**
 * Removes the resource cost of creating a new city from the country
 * - triggered by [GameEventCityCreate]
 * - triggers nothing
 */
class GameActionCityCreationCost(
    private val gameConfig: GameConfig
) : GameAction<GameEventCityCreate>(GameEventCityCreate.TYPE) {

    override suspend fun perform(event: GameEventCityCreate): List<GameEvent> {
        val city = getCity(event)
        val country = getCountry(event)
        removeCityFoundingCost(country, city)
        return listOf()
    }


    private fun removeCityFoundingCost(country: Country, city: City) {
        country.resources.money -= if (city.isProvinceCapital) gameConfig.cityCostMoney else gameConfig.townCostMoney
    }


    private fun getCity(event: GameEventCityCreate): City {
        return event.city
    }


    private fun getCountry(event: GameEventCityCreate): Country {
        return event.country
    }

}