package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEventType
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.CreateBuildingEvent
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Country

/**
 * Handles the cost of building a city
 */
class BuildingCreationCostAction(private val gameConfig: GameConfig) : GameAction<CreateBuildingEvent>() {

    override suspend fun triggeredBy(): List<GameEventType> {
        return listOf(CreateBuildingEvent::class.simpleName!!)
    }


    override suspend fun perform(event: CreateBuildingEvent): List<GameEvent> {
        val country = getCountry(event)
        removeCost(country)
        return listOf()
    }

    private fun getCountry(event: CreateBuildingEvent): Country {
        return event.game.countries.find { it.countryId == event.countryId }!!
    }

    private fun removeCost(country: Country) {
        country.resources.wood -= gameConfig.buildingCostWood
        country.resources.stone -= gameConfig.buildingCostStone
    }

}