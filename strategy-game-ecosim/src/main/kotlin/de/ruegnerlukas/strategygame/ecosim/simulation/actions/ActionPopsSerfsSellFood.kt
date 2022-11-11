package de.ruegnerlukas.strategygame.ecosim.simulation.actions

import de.ruegnerlukas.strategygame.ecosim.simulation.SimAction
import de.ruegnerlukas.strategygame.ecosim.simulation.SimContext
import de.ruegnerlukas.strategygame.ecosim.simulation.Simulation
import de.ruegnerlukas.strategygame.ecosim.world.ResourceType
import de.ruegnerlukas.strategygame.ecosim.world.SerfPopUnit

class ActionPopsSerfsSellFood(simulation: Simulation) : SimAction(simulation) {

    override fun execute(simContext: SimContext) {
        simContext.world.cities.forEach { city ->
            val pops = city.getPop<SerfPopUnit>()
            val amountSellFood = pops.getResourceBalance(ResourceType.FOOD) * 0.8f
            pops.addResourceInput(
                ResourceType.MONEY,
                amountSellFood * 1f * city.market.getResourcePriceModifier(ResourceType.FOOD),
                "food-market"
            )
            pops.addResourceOutput(
                ResourceType.FOOD,
                amountSellFood,
                "food-market"
            )
//            city.market.addResourceInput(
//                ResourceType.FOOD,
//                amountSellFood,
//                "serfs"
//            )
        }
    }

}