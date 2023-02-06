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
import de.ruegnerlukas.strategygame.backend.ports.models.TradeRoute
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
		println("LOCAL MARKET UPDATE")
		event.game.provinces.forEach { province ->
			println("..PROVINCE=${province.provinceId}")
			province.cityIds
				.map { getCity(event.game, it) }
				.sortedBy { it.isProvinceCapital }
				.forEach {
					println("....CITY=${it.cityId}")
					handleCityProduction(province, it)
				}
		}

		println("TRADE UPDATE")
		handleTrade(event.game)

		println("POPULATION UPDATE")
		event.game.provinces.forEach { province ->
			println("..PROVINCE=${province.provinceId}")
			province.cityIds
				.map { getCity(event.game, it) }
				.sortedBy { it.isProvinceCapital }
				.forEach {
					println("....CITY=${it.cityId}")
					handleCityFoodConsumption(province, it)
				}
		}

		println("BALANCE REPORT")
		event.game.provinces.forEach { province ->
			println("..PROVINCE=${province.provinceId}")
			MarketUtils.getResourceBalance(province).toList().forEach { (type, balance) ->
				println("      $type: $balance")
				println("                 producedPrev: ${province.resourcesProducedPrevTurn[type]}")
				println("                 consumedCurr: ${province.resourcesConsumedCurrTurn[type]}")
				println("                 producedCurr: ${province.resourcesProducedCurrTurn[type]}")
				println("                 missing: ${province.resourcesMissing[type]}")
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
			println("      ${building.type} does not have a required tile resource")
			return false
		}
		if (!areResourcesAvailable(province, building.type.templateData.requires)) {
			building.type.templateData.requires.forEach {
				province.resourcesMissing.add(it.type, it.amount)
				println("      ${building.type} is missing required resource ${it.type} ${it.amount}x")
			}
			return false
		}
		building.type.templateData.requires.forEach { requiredResource ->
			province.resourcesConsumedCurrTurn.add(requiredResource.type, requiredResource.amount)
			println("      ${building.type} consumed ${requiredResource.type} ${requiredResource.amount}x")
		}
		building.type.templateData.produces.forEach { producedResource ->
			province.resourcesProducedCurrTurn.add(producedResource.type, producedResource.amount)
			println("      ${building.type} produced ${producedResource.type} ${producedResource.amount}x")
		}
		return true
	}

	private fun handleCityFoodConsumption(province: Province, city: City) {
		val requiredFoodAmount = if (city.isProvinceCapital) gameConfig.cityFoodCostPerTurn else gameConfig.townFoodCostPerTurn
		val possibleFoodAmount = min(requiredFoodAmount, availableResourceAmount(province, ResourceType.FOOD))
		val missingFoodAmount = requiredFoodAmount - possibleFoodAmount
		province.resourcesConsumedCurrTurn.add(ResourceType.FOOD, possibleFoodAmount)
		println("      population consumed food ${possibleFoodAmount}x")
		if (missingFoodAmount > 0) {
			province.resourcesMissing.add(ResourceType.FOOD, missingFoodAmount)
			println("      population is missing food ${missingFoodAmount}x")
		}
	}

	private fun handleTrade(game: GameExtended) {
		game.provinces
			.asSequence()
			.flatMap { it.tradeRoutes }
			.sortedByDescending { it.rating }
			.forEach { handleTrade(game, it) }
	}

	private fun handleTrade(game: GameExtended, tradeRoute: TradeRoute) {
		val srcProvince = getProvince(game, tradeRoute.srcProvinceId)
		val dstProvince = getProvince(game, tradeRoute.dstProvinceId)
		val amount = calculateTradeAmount(srcProvince, dstProvince, tradeRoute.resourceType)
		srcProvince.resourcesConsumedCurrTurn.add(tradeRoute.resourceType, amount)
		dstProvince.resourcesProducedCurrTurn.add(tradeRoute.resourceType, amount)
		println("      trade route ${srcProvince.provinceId}->${dstProvince.provinceId} transferred ${tradeRoute.resourceType} ${amount}x")
	}

	private fun calculateTradeAmount(src: Province, dst: Province, type: ResourceType): Float {
		val target = (MarketUtils.getResourceBalance(src, type) + MarketUtils.getResourceBalance(dst, type)) / 2f
		val requiredAmount = -(MarketUtils.getResourceBalance(dst, type) - target)
		return min(MarketUtils.getResourceBalance(src, type), requiredAmount)
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

	private fun getCity(game: GameExtended, cityId: String): City {
		return game.cities.find { it.cityId == cityId }!!
	}

	private fun getProvince(game: GameExtended, provinceId: String): Province {
		return game.provinces.find { it.provinceId == provinceId }!!
	}


}