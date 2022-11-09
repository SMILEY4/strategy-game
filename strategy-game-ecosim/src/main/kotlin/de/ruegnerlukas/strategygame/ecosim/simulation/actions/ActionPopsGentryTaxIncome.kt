package de.ruegnerlukas.strategygame.ecosim.simulation.actions

import de.ruegnerlukas.strategygame.ecosim.simulation.SimAction
import de.ruegnerlukas.strategygame.ecosim.simulation.SimContext
import de.ruegnerlukas.strategygame.ecosim.simulation.Simulation
import de.ruegnerlukas.strategygame.ecosim.world.GentryPopUnit
import de.ruegnerlukas.strategygame.ecosim.world.ResourceType
import de.ruegnerlukas.strategygame.ecosim.world.SerfPopUnit

class ActionPopsGentryTaxIncome(simulation: Simulation) : SimAction(simulation) {

    override fun execute(simContext: SimContext) {
        simContext.world.cities.forEach { city ->
            val popsSerfs = city.getPop<SerfPopUnit>()
            val popsGentry = city.getPop<GentryPopUnit>()
            popsGentry.addResourceInput(
                ResourceType.FOOD,
                popsSerfs.getTotalResourceInput(ResourceType.FOOD) * popsSerfs.foodTaxRate,
                "tax"
            )
        }
    }

}