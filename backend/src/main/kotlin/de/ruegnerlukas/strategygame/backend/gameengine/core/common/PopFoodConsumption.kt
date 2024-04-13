package de.ruegnerlukas.strategygame.backend.gameengine.core.common

import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.EconomyPopFoodConsumptionProvider
import kotlin.math.ceil

class PopFoodConsumption: EconomyPopFoodConsumptionProvider {

    override fun getRequiredFood(city: City): Float {
        return ceil(city.population.size / 4f)
    }

}