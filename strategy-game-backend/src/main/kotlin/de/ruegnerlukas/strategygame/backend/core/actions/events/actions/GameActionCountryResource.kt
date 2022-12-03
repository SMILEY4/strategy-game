package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventWorldUpdate
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.Building
import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended

/**
 * Handles turn-income and turn-expenses
 * - triggered by [GameEventWorldUpdate]
 * - triggers nothing
 */
class GameActionCountryResource(
    private val gameConfig: GameConfig
) : GameAction<GameEventWorldUpdate>(GameEventWorldUpdate.TYPE) {

    override suspend fun perform(event: GameEventWorldUpdate): List<GameEvent> {
        event.game.cities.forEach { city ->
            getCountry(event.game, city)?.let { country ->
                handleCityBaseIncome(country)
                handleCityBaseExpenses(country, city)
                handleBuildingIncome(country, city)
            }
        }
        return listOf()
    }


    private fun handleCityBaseIncome(country: Country) {
        country.resources.money += gameConfig.cityIncomePerTurn
    }


    private fun handleCityBaseExpenses(country: Country, city: City) {
        country.resources.food -= if (city.isProvinceCapital) gameConfig.cityFoodCostPerTurn else gameConfig.townFoodCostPerTurn
    }


    private fun handleBuildingIncome(country: Country, city: City) {
        city.buildings
            .filter { it.tile != null }
            .forEach { handleBuildingIncome(country, city, it) }
    }


    private fun handleBuildingIncome(country: Country, city: City, building: Building) {
        val production = if (city.isProvinceCapital) {
            gameConfig.cityBuildingProductionPerTurn
        } else {
            gameConfig.townBuildingProductionPerTurn
        }
        when (building.type) {
            BuildingType.LUMBER_CAMP -> country.resources.wood += production
            BuildingType.MINE -> country.resources.metal += production
            BuildingType.QUARRY -> country.resources.stone += production
            BuildingType.HARBOR -> country.resources.food += production
            BuildingType.FARM -> country.resources.food += production
        }
    }


    private fun getCountry(game: GameExtended, city: City): Country? {
        return game.countries.find { it.countryId == city.countryId }
    }

}