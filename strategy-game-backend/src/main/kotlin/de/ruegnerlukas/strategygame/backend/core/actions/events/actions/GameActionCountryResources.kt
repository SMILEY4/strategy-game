package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventWorldUpdate
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType

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
            province.turnResourceBalance = mutableMapOf<ResourceType, Float>().also {
                ResourceType.values().forEach { resourceType ->
                    it[resourceType] = 0f
                }
            }
            province.cityIds
                .map { getCity(event.game, it) }
                .sortedBy { it.isProvinceCapital }
                .forEach { handleCity(it, province) }
        }
        return listOf()
    }


    private fun handleCity(city: City, province: Province) {
        city.buildings
            .filter { it.tile != null }
            .filter { it.type.templateData.requires.isEmpty() }
            .forEach { building ->
                val production = if (city.isProvinceCapital) {
                    gameConfig.cityBuildingProductionPerTurn
                } else {
                    gameConfig.townBuildingProductionPerTurn
                }
                building.type.templateData.produces.forEach { producedResource ->
                    val prev = province.turnResourceBalance!![producedResource.type]!!
                    val next = prev + producedResource.amount * production
                    province.turnResourceBalance!![producedResource.type] = next
                }
            }
        val foodConsumption = if (city.isProvinceCapital) gameConfig.cityFoodCostPerTurn else gameConfig.townFoodCostPerTurn
        province.turnResourceBalance!![ResourceType.FOOD] = province.turnResourceBalance!![ResourceType.FOOD]!! - foodConsumption
    }


    private fun getCity(game: GameExtended, cityId: String): City {
        return game.cities.find { it.cityId == cityId }!!
    }

}