package de.ruegnerlukas.strategygame.backend.core.actions.update

import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.shared.Logging

/**
 * Updates the growth-progress of a city based on various factors
 */
class CityGrowthUpdateAction(private val config: GameConfig) : Logging {

    fun perform(game: GameExtended) {
        game.cities.forEach { update(it) }
    }

    private fun update(city: City) {
        var points = 0

        if (city.popGrowthConsumedFood) {
            log().debug("adding growth-point for city ${city.cityId}: pop-growth-consumed-food=true (+1)")
            points++
        }
        if (city.popConsumedFood < (if (city.isProvinceCapital) config.cityFoodCostPerTurn else config.townFoodCostPerTurn)) {
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