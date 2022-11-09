package de.ruegnerlukas.strategygame.ecosim.simulation.actions

import de.ruegnerlukas.strategygame.ecosim.simulation.SimAction
import de.ruegnerlukas.strategygame.ecosim.simulation.SimContext
import de.ruegnerlukas.strategygame.ecosim.simulation.Simulation
import de.ruegnerlukas.strategygame.ecosim.utils.FastNoiseLite
import de.ruegnerlukas.strategygame.ecosim.world.SerfPopUnit

class ActionFoodYield(simulation: Simulation) : SimAction(simulation) {

    override fun execute(simContext: SimContext) {
        simContext.world.cities.forEach { city ->
            city.foodYield = f(city.getPop<SerfPopUnit>().amount.toFloat(), 1.1f, 1.6f, 3f)
        }
    }

    private fun f(x: Float, a: Float, b: Float, c: Float): Float {
        return (a * x + b * c) / (c + x)
    }

}