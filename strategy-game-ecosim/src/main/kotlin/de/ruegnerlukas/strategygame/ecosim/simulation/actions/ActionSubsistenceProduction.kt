package de.ruegnerlukas.strategygame.ecosim.simulation.actions

import de.ruegnerlukas.strategygame.ecosim.simulation.SimAction
import de.ruegnerlukas.strategygame.ecosim.simulation.SimContext
import de.ruegnerlukas.strategygame.ecosim.simulation.Simulation
import de.ruegnerlukas.strategygame.ecosim.world.PopType
import de.ruegnerlukas.strategygame.ecosim.world.ResourceType

class ActionSubsistenceProduction(simulation: Simulation) : SimAction(simulation) {

    override fun execute(simContext: SimContext) {
        simContext.world.cities.forEach { city ->
            val pops = city.getPop(PopType.SUBSISTENCE_FARMER)
            if (pops.amount > 0) {
                pops.addResourceIn(ResourceType.FOOD, pops.amount * 1f, "subsistence-farming")
            }
        }
    }


}