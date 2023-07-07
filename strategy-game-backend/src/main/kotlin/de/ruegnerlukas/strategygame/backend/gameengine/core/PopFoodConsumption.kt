package de.ruegnerlukas.strategygame.backend.gameengine.core

import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City
import de.ruegnerlukas.strategygame.backend.economy.ports.required.EconomyPopFoodConsumptionProvider
import kotlin.math.ceil

class PopFoodConsumption: EconomyPopFoodConsumptionProvider {

    override fun getRequiredFood(city: City): Float {
        return ceil(city.population.size / 4f)
    }

}