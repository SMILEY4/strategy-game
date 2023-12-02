package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.detaillog.FloatDetailLogValue
import de.ruegnerlukas.strategygame.backend.common.events.BasicEventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.utils.buildMutableMap
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.EconomyPopFoodConsumptionProvider
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityPopulationGrowthDetailType
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended

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
        city.population.growthDetailLog.clear()

        if (city.population.growthConsumedFood) {
            log().debug("adding growth-point for city ${city.cityId}: pop-growth-consumed-food=true (+1)")
            points++
            city.population.growthDetailLog.addDetail(CityPopulationGrowthDetailType.MORE_FOOD_AVAILABLE, buildMutableMap {
                this["amount"] = FloatDetailLogValue(+1f)
            })
        }
        if (city.population.consumedFood < getRequiredFood(city)) {
            log().debug("adding growth-point for city ${city.cityId}: pop-consumed-food below required (-1)")
            points--
            city.population.growthDetailLog.addDetail(CityPopulationGrowthDetailType.NOT_ENOUGH_FOOD, buildMutableMap {
                this["amount"] = FloatDetailLogValue(-1f)
            })
        }
        if (city.population.consumedFood < 0.001f) {
            log().debug("adding growth-point for city ${city.cityId}: pop-consumed-food is zero (-1)")
            points--
            city.population.growthDetailLog.addDetail(CityPopulationGrowthDetailType.STARVING, buildMutableMap {
                this["amount"] = FloatDetailLogValue(-1f)
            })
        }
        if (city.meta.isProvinceCapital) {
            log().debug("adding growth-point for city ${city.cityId}: capital (+1)")
            points++
            city.population.growthDetailLog.addDetail(CityPopulationGrowthDetailType.PROVINCE_CAPITAL, buildMutableMap {
                this["amount"] = FloatDetailLogValue(+1f)
            })
        }
        if (city.population.size >= city.tier.maxSize && points > 0) {
            // MUST/SHOULD ALWAYS BE LAST !!
            log().debug("removing growth-point(s) for city ${city.cityId}: max population size for tier (-${points})")
            points = 0
            city.population.growthDetailLog.clear()
            city.population.growthDetailLog.addDetail(CityPopulationGrowthDetailType.MAX_SIZE_REACHED, mutableMapOf())
        }
        val growthChange = points / 10f
        city.population.growthProgress += growthChange
        log().info("new growth progress of city ${city.cityId} is ${city.population.growthProgress} (added $growthChange)")
    }

    private fun getRequiredFood(city: City): Float {
        return popFoodConsumption.getRequiredFood(city)
    }

}