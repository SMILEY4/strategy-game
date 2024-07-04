package io.github.smiley4.strategygame.backend.engine.module.core.eco

import io.github.smiley4.strategygame.backend.engine.ports.models.City


interface EconomyPopFoodConsumptionProvider {
    fun getRequiredFood(city: City): Float
}