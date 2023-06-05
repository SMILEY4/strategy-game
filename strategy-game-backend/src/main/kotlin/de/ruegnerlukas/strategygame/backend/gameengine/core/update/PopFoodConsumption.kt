package de.ruegnerlukas.strategygame.backend.gameengine.core.update

import de.ruegnerlukas.strategygame.backend.common.models.City
import de.ruegnerlukas.strategygame.backend.economy.ports.required.EconomyPopFoodConsumptionProvider
import kotlin.math.ceil

class PopFoodConsumption: EconomyPopFoodConsumptionProvider {

    override fun getRequiredFood(city: City): Float {
        return ceil(city.size / 4f)
    }

}