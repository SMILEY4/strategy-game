package io.github.smiley4.strategygame.backend.engine.module.core.common

import io.github.smiley4.strategygame.backend.engine.core.eco.EconomyPopFoodConsumptionProvider
import io.github.smiley4.strategygame.backend.engine.ports.models.City
import kotlin.math.ceil

class PopFoodConsumption: EconomyPopFoodConsumptionProvider {

    override fun getRequiredFood(city: City): Float {
        return ceil(city.population.size / 4f)
    }

}