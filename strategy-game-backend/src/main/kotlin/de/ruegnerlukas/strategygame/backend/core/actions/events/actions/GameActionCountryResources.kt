package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventResourcesUpdate
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventWorldUpdate
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceLedger
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceLedgerEntry
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStack
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
            val previousLedger = province.resourceLedgerPrevTurn
            val currentLedger = province.resourceLedgerCurrTurn

            province.cityIds
                .map { getCity(event.game, it) }
                .sortedBy { it.isProvinceCapital }
                .forEach {
                    handleCityProduction(it, previousLedger, currentLedger)
                    handleCityFoodConsumption(it, currentLedger)
                }
        }
        return listOf(GameEventResourcesUpdate(event.game))
    }


    private fun handleCityProduction(
        city: City,
        previousLedger: ResourceLedger,
        currentLedger: ResourceLedger,
    ) {
        city.buildings
            .onEach { it.active = false }
            .filter { it.type.templateData.requiredTileResource == null || it.tile != null }
            .filter { resourcesAvailable(it.type.templateData.requires, previousLedger, currentLedger) }
            .sortedBy { it.type.order }
            .forEach { building ->
                building.active = true
                building.type.templateData.requires.forEach { requiredResource ->
                    currentLedger.addEntry(requiredResource.type, -requiredResource.amount, ResourceLedger.reasonBuilding(building.type))
                }
                building.type.templateData.produces.forEach { producedResource ->
                    currentLedger.addEntry(producedResource.type, +producedResource.amount, ResourceLedger.reasonBuilding(building.type))
                }
            }
    }


    private fun handleCityFoodConsumption(city: City, currentLedger: ResourceLedger) {
        val foodConsumption = if (city.isProvinceCapital) gameConfig.cityFoodCostPerTurn else gameConfig.townFoodCostPerTurn
        currentLedger.addEntry(ResourceType.FOOD, -foodConsumption, ResourceLedger.reasonPopulationFoodConsumption())
    }


    private fun getCity(game: GameExtended, cityId: String): City {
        return game.cities.find { it.cityId == cityId }!!
    }

    private fun getAvailableResources(resourceType: ResourceType, previousLedger: ResourceLedger, currentLedger: ResourceLedger): Float {
        return previousLedger.getChangeInput(resourceType) - currentLedger.getChangeOutput(resourceType)
    }

    private fun resourcesAvailable(reqResources: List<ResourceStack>, prevLedger: ResourceLedger, currLedger: ResourceLedger): Boolean {
        return reqResources.all { getAvailableResources(it.type, prevLedger, currLedger) >= it.amount }
    }

}