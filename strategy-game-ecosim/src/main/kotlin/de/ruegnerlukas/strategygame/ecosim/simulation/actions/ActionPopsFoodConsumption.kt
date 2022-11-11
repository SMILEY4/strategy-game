package de.ruegnerlukas.strategygame.ecosim.simulation.actions

import de.ruegnerlukas.strategygame.ecosim.simulation.SimAction
import de.ruegnerlukas.strategygame.ecosim.simulation.SimContext
import de.ruegnerlukas.strategygame.ecosim.simulation.Simulation
import de.ruegnerlukas.strategygame.ecosim.world.ResourceType
import de.ruegnerlukas.strategygame.ecosim.world.SerfPopUnit

class ActionPopsFoodConsumption(simulation: Simulation) : SimAction(simulation) {

    override fun execute(simContext: SimContext) {
        simContext.world.cities.forEach { city ->
            city.population.forEach { pops ->
                pops.addResourceOutput(
                    ResourceType.FOOD,
                    pops.amount * pops.foodConsumption,
                    "consumption"
                )
                city.market.addResourceOutput(
                    ResourceType.FOOD,
                    pops.amount * pops.foodConsumption,
                    "consumption"
                )
            }
//            val pops = city.getPop<SerfPopUnit>()
//            pops.addResourceOutput(
//                ResourceType.FOOD,
//                pops.amount * pops.foodConsumption,
//                "consumption"
//            )
//            city.market.addResourceOutput(
//                ResourceType.FOOD,
//                pops.amount * pops.foodConsumption,
//                "consumption"
//            )
        }
    }

}