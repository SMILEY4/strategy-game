package io.github.smiley4.strategygame.backend.engine.module.eco

import io.github.smiley4.strategygame.backend.commondata.City

interface EconomyPopFoodConsumptionProvider {
    fun getRequiredFood(city: City): Float
}