package de.ruegnerlukas.strategygame.backend.core.actions.update

import de.ruegnerlukas.strategygame.backend.ports.models.City
import kotlin.math.ceil

class PopFoodConsumption {

    fun getRequiredFood(city: City): Float {
        return ceil(city.size / 4f)
    }

}