package de.ruegnerlukas.strategygame.backend.gameengine.core.eco

import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City

interface EconomyPopFoodConsumptionProvider {
    fun getRequiredFood(city: City): Float
}