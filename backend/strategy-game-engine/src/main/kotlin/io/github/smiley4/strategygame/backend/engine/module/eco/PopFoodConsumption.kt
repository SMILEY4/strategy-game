package io.github.smiley4.strategygame.backend.engine.module.eco

import io.github.smiley4.strategygame.backend.commondata.City
import kotlin.math.ceil

class PopFoodConsumption: EconomyPopFoodConsumptionProvider {

    override fun getRequiredFood(city: City): Float {
        return ceil(city.population.size / 4f)
    }

}