package de.ruegnerlukas.strategygame.ecosim.simulation.actions

import de.ruegnerlukas.strategygame.ecosim.simulation.SimAction
import de.ruegnerlukas.strategygame.ecosim.simulation.SimContext
import de.ruegnerlukas.strategygame.ecosim.simulation.Simulation
import de.ruegnerlukas.strategygame.ecosim.world.ResourceType

class ActionFoodConsumption(simulation: Simulation) : SimAction(simulation) {

    override fun execute(simContext: SimContext) {
        simContext.world.cities.forEach { city ->
            city.population.forEach { pops ->
                val requiredFood = pops.amount * 1f
                pops.addResourceOut(ResourceType.FOOD, requiredFood, "consumption")
            }
        }
    }


}