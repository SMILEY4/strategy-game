package de.ruegnerlukas.strategygame.ecosim.simulation.actions

import de.ruegnerlukas.strategygame.ecosim.simulation.SimAction
import de.ruegnerlukas.strategygame.ecosim.simulation.SimContext
import de.ruegnerlukas.strategygame.ecosim.simulation.Simulation
import de.ruegnerlukas.strategygame.ecosim.world.ResourceType
import de.ruegnerlukas.strategygame.ecosim.world.SerfPopUnit

class ActionPopsSerfsRawResourceProduction(simulation: Simulation) : SimAction(simulation) {

    companion object {
        private const val PRODUCTION_PER_PERSON = 1.25f
    }

    override fun execute(simContext: SimContext) {
        simContext.world.cities.forEach { city ->
            val pops = city.getPop<SerfPopUnit>()
            val producedFood = pops.amount * PRODUCTION_PER_PERSON * city.foodYield * simContext.world.agricultureEfficiency
            pops.addResourceInput(
                ResourceType.FOOD,
                producedFood,
                "raw-production"
            )
        }
    }

}