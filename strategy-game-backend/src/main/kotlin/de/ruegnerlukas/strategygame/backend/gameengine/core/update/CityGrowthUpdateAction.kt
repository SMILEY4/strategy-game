package de.ruegnerlukas.strategygame.backend.gameengine.core.update

import de.ruegnerlukas.strategygame.backend.common.models.City
import de.ruegnerlukas.strategygame.backend.common.Logging
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended

/**
 * Updates the growth-progress of a city based on various factors
 */
class CityGrowthUpdateAction(private val popFoodConsumption: PopFoodConsumption) : Logging {

    fun perform(game: GameExtended) {
        game.cities.forEach { update(it) }
    }

    private fun update(city: City) {
        var points = 0

        if (city.popGrowthConsumedFood) {
            log().debug("adding growth-point for city ${city.cityId}: pop-growth-consumed-food=true (+1)")
            points++
        }
        if (city.popConsumedFood < popFoodConsumption.getRequiredFood(city)) {
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

}