package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventResourcesUpdate
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceLedger
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType

/**
 * Updates the market and trade
 * - triggered by [GameEventResourcesUpdate]
 * - triggers nothing
 */
class GameActionMarketUpdate : GameAction<GameEventResourcesUpdate>(GameEventResourcesUpdate.TYPE) {

    override suspend fun perform(event: GameEventResourcesUpdate): List<GameEvent> {
        event.game.provinces.forEach { province ->
            val available = ResourceType.values().associateWith { province.resourceLedgerPrevTurn.getChangeInput(it) }
            val required = calculateTotalRequiredResources(event.game, province)
            // TODO
        }
        return listOf()
    }

    private fun calculateTotalRequiredResources(game: GameExtended, province: Province): Map<ResourceType, Float> {
        val resources = ResourceType.values().associateWith { 0f }.toMutableMap()

        // food consumption
        resources[ResourceType.FOOD] = resources[ResourceType.FOOD]!! + (province.resourceLedgerPrevTurn.getEntriesOutput(ResourceType.FOOD)
            .find { it.reason == ResourceLedger.reasonPopulationFoodConsumption() }?.change ?: 0f)

        // building production
        province.cityIds.map { getCity(game, it) }.forEach { city ->
            city.buildings
                .filter { it.type.templateData.requiredTileResource == null || it.tile != null }
                .forEach { building ->
                    building.type.templateData.requires.forEach { reqResource ->
                        resources[reqResource.type] = resources[reqResource.type]!! + reqResource.amount
                    }
                }
        }

        return resources

    }

    private fun getCity(game: GameExtended, cityId: String): City {
        return game.cities.find { it.cityId == cityId }!!
    }

}