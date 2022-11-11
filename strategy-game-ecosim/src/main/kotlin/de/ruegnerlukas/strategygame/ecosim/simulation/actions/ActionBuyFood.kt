package de.ruegnerlukas.strategygame.ecosim.simulation.actions

import de.ruegnerlukas.strategygame.ecosim.simulation.SimAction
import de.ruegnerlukas.strategygame.ecosim.simulation.SimContext
import de.ruegnerlukas.strategygame.ecosim.simulation.Simulation
import de.ruegnerlukas.strategygame.ecosim.world.PopType
import de.ruegnerlukas.strategygame.ecosim.world.ResourceType

class ActionBuyFood(simulation: Simulation) : SimAction(simulation) {

    override fun execute(simContext: SimContext) {
        simContext.world.cities.forEach { city ->
            city.population.forEach { pops ->
                val consumption = pops.amount
                val available = pops.getResourceBalance(ResourceType.FOOD)
                if(consumption > available) {
                    val required = consumption - available
                    pops.addResourceIn(ResourceType.FOOD, required, "buy-food")
                    pops.addResourceOut(ResourceType.MONEY, required, "buy-food")
                }
            }
        }
    }


}