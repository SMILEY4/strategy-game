package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventWorldUpdate
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Province

/**
 * Handles turn-income and turn-expenses
 * - triggered by [GameEventWorldUpdate]
 * - triggers nothing
 */
class GameActionCountryResources(
    private val gameConfig: GameConfig
) : GameAction<GameEventWorldUpdate>(GameEventWorldUpdate.TYPE) {

    override suspend fun perform(event: GameEventWorldUpdate): List<GameEvent> {
        event.game.provinces.forEach { province ->
            province.turnResourceBalance = mutableMapOf<String,Float>().also {
                it["wood"] = 0f
                it["metal"] = 0f
                it["stone"] = 0f
                it["food"] = 0f
                it["money"] = 0f
            }
            province.cityIds
                .map { getCity(event.game, it) }
                .sortedBy { it.isProvinceCapital }
                .forEach { handleCity(it, province)}
        }
        return listOf()
    }


    private fun handleCity(city: City, province: Province) {
        if(city.isProvinceCapital) {
            province.turnResourceBalance!!["money"] = province.turnResourceBalance!!["money"]!! + gameConfig.cityIncomePerTurn
        }
        city.buildings
            .filter { it.tile != null }
            .forEach { building ->
                val production = if (city.isProvinceCapital) {
                    gameConfig.cityBuildingProductionPerTurn
                } else {
                    gameConfig.townBuildingProductionPerTurn
                }
                when (building.type) {
                    BuildingType.LUMBER_CAMP -> province.turnResourceBalance!!["wood"] = province.turnResourceBalance!!["wood"]!! + production
                    BuildingType.MINE -> province.turnResourceBalance!!["metal"] = province.turnResourceBalance!!["metal"]!! + production
                    BuildingType.QUARRY -> province.turnResourceBalance!!["stone"] = province.turnResourceBalance!!["stone"]!! + production
                    BuildingType.HARBOR -> province.turnResourceBalance!!["food"] = province.turnResourceBalance!!["food"]!! + production
                    BuildingType.FARM -> province.turnResourceBalance!!["food"] = province.turnResourceBalance!!["food"]!! + production
                }
            }
        val foodConsumption = if (city.isProvinceCapital) gameConfig.cityFoodCostPerTurn else gameConfig.townFoodCostPerTurn
        province.turnResourceBalance!!["food"] = province.turnResourceBalance!!["food"]!! - foodConsumption
    }


    private fun getCity(game: GameExtended, cityId: String): City {
        return game.cities.find { it.cityId == cityId }!!
    }

}