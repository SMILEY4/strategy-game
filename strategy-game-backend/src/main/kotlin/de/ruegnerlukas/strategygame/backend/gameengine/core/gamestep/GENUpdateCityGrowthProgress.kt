package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.events.BasicEventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.City
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.economy.ports.required.EconomyPopFoodConsumptionProvider

/**
 * Updates the growth-progress of a city based on various factors
 */
class GENUpdateCityGrowthProgress(private var popFoodConsumption: EconomyPopFoodConsumptionProvider, eventSystem: EventSystem) : Logging {

    object Definition : BasicEventNodeDefinition<GameExtended, GameExtended>()

    init {
        eventSystem.createNode(Definition) {
            trigger(GENUpdateEconomy.Definition.after())
            action { game ->
                log().debug("Update city growth progress")
                game.cities.forEach { update(it) }
                eventResultOk(game)
            }
        }
    }

    private fun update(city: City) {
        var points = 0

        if (city.popGrowthConsumedFood) {
            log().debug("adding growth-point for city ${city.cityId}: pop-growth-consumed-food=true (+1)")
            points++
        }
        if (city.popConsumedFood < getRequiredFood(city)) {
            log().debug("adding growth-point for city ${city.cityId}: pop-consumed-food below required (-1)")
            points--
        }
        if (city.popConsumedFood < 0.001f) {
            log().debug("adding growth-point for city ${city.cityId}: pop-consumed-food is zero (-1)")
            points--
        }
        if (city.isProvinceCapital) {
            log().debug("adding growth-point for city ${city.cityId}: capital (+1)")
            points++
        }

        val growthChange = points / 10f
        city.growthProgress += growthChange
        log().debug("new growth progress of city ${city.cityId} is ${city.growthProgress} (added $growthChange)")
    }

    private fun getRequiredFood(city: City): Float {
        return popFoodConsumption.getRequiredFood(city)
    }

}