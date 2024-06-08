package io.github.smiley4.strategygame.backend.engine.core.eco

import io.github.smiley4.strategygame.backend.engine.ports.models.City


interface EconomyPopFoodConsumptionProvider {
    fun getRequiredFood(city: City): Float
}