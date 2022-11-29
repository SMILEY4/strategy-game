package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventWorldUpdate
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType

class GameActionCountryResource(
    private val gameConfig: GameConfig
) : GameAction<GameEventWorldUpdate>(GameEventWorldUpdate.TYPE) {

    override suspend fun perform(event: GameEventWorldUpdate): List<GameEvent> {
        event.game.cities.forEach { city ->
            val country = event.game.countries.find { it.countryId == city.countryId }
            if (country != null) {
                country.resources.money += gameConfig.cityIncomePerTurn
                country.resources.food -= if (city.isProvinceCapital) gameConfig.cityFoodCostPerTurn else gameConfig.townFoodCostPerTurn
                city.buildings
                    .filter { it.tile != null }
                    .forEach { building ->
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
            }
        }
        return listOf()
    }

}