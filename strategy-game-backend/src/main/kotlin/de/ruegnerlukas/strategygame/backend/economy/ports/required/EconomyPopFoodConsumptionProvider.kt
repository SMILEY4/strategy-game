package de.ruegnerlukas.strategygame.backend.economy.ports.required

import de.ruegnerlukas.strategygame.backend.common.models.City

interface EconomyPopFoodConsumptionProvider {
    fun getRequiredFood(city: City): Float
}