package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventResourcesUpdate
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventWorldUpdate
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.Building
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStack
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType
import kotlin.math.min

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
			province.cityIds
				.map { getCity(event.game, it) }
				.sortedBy { it.isProvinceCapital }
				.forEach {
					handleCityProduction(province, it)
					handleCityFoodConsumption(province, it)
				}
		}
		return listOf(GameEventResourcesUpdate(event.game))
	}


	private fun handleCityProduction(province: Province, city: City) {
		city.buildings
			.sortedBy { it.type.order }
			.forEach { building ->
				building.active = handleBuildingProduction(province, building)
			}
	}

	private fun handleBuildingProduction(province: Province, building: Building): Boolean {
		if (building.type.templateData.requiredTileResource != null && building.tile == null) {
			return false
		}
		if (!areResourcesAvailable(province, building.type.templateData.requires)) {
			building.type.templateData.requires.forEach { province.resourcesMissing.add(it.type, it.amount) }
			return false
		}
		building.type.templateData.requires.forEach { requiredResource ->
			province.resourcesConsumedCurrTurn.add(requiredResource.type, requiredResource.amount)
		}
		building.type.templateData.produces.forEach { producedResource ->
			province.resourcesProducedCurrTurn.add(producedResource.type, producedResource.amount)
		}
		return true
	}

	private fun handleCityFoodConsumption(province: Province, city: City) {
		val requiredFoodAmount = if (city.isProvinceCapital) gameConfig.cityFoodCostPerTurn else gameConfig.townFoodCostPerTurn
		val possibleFoodAmount = min(requiredFoodAmount, availableResourceAmount(province, ResourceType.FOOD))
		val missingFoodAmount = requiredFoodAmount - possibleFoodAmount
		province.resourcesConsumedCurrTurn.add(ResourceType.FOOD, possibleFoodAmount)
		if (missingFoodAmount > 0) {
			province.resourcesMissing.add(ResourceType.FOOD, possibleFoodAmount)
		}
	}

	private fun getCity(game: GameExtended, cityId: String): City {
		return game.cities.find { it.cityId == cityId }!!
	}

	private fun availableResourceAmount(province: Province, type: ResourceType): Float {
		return province.resourcesProducedPrevTurn[type] - province.resourcesConsumedCurrTurn[type]
	}

	private fun isResourceAvailable(province: Province, type: ResourceType, amount: Float): Boolean {
		return availableResourceAmount(province, type) >= amount
	}

	private fun areResourcesAvailable(province: Province, resources: Collection<ResourceStack>): Boolean {
		return resources.all { isResourceAvailable(province, it.type, it.amount) }
	}

}