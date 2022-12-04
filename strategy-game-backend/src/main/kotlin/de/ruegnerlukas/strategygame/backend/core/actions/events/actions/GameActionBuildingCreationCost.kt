package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventBuildingCreate
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.Country

/**
 * Removes the resource cost of creating a building from the country
 * - triggered by [GameEventBuildingCreate]
 * - triggers nothing
 */
class GameActionBuildingCreationCost(
    private val gameConfig: GameConfig
) : GameAction<GameEventBuildingCreate>(GameEventBuildingCreate.TYPE) {

    override suspend fun perform(event: GameEventBuildingCreate): List<GameEvent> {
        val country = getCountry(event)
        removeCost(country)
        return listOf()
    }

    private fun getCountry(event: GameEventBuildingCreate): Country {
        return event.country
    }

    private fun removeCost(country: Country) {
        country.resources.wood -= gameConfig.buildingCostWood
        country.resources.stone -= gameConfig.buildingCostStone
    }

}