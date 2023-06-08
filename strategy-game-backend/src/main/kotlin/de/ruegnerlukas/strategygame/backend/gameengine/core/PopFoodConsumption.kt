package de.ruegnerlukas.strategygame.backend.gameengine.core

class PopFoodConsumption: EconomyPopFoodConsumptionProvider {

    override fun getRequiredFood(city: City): Float {
        return ceil(city.size / 4f)
    }

}