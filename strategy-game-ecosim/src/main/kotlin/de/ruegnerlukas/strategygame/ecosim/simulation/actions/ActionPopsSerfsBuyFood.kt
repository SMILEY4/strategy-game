package de.ruegnerlukas.strategygame.ecosim.simulation.actions

import de.ruegnerlukas.strategygame.ecosim.simulation.SimAction
import de.ruegnerlukas.strategygame.ecosim.simulation.SimContext
import de.ruegnerlukas.strategygame.ecosim.simulation.Simulation
import de.ruegnerlukas.strategygame.ecosim.world.ResourceType
import de.ruegnerlukas.strategygame.ecosim.world.SerfPopUnit
import kotlin.math.abs
import kotlin.math.min

class ActionPopsSerfsBuyFood(simulation: Simulation) : SimAction(simulation) {

    override fun execute(simContext: SimContext) {
        simContext.world.cities.forEach { city ->
            val pops = city.getPop<SerfPopUnit>()
            val availableFood = pops.getResourceBalance(ResourceType.FOOD)
            if (availableFood < 0) {
                val requiredFood = abs(availableFood)
                val requiredMoney = requiredFood * city.marketPriceFood
                val availableMoney = pops.getResourcesStored(ResourceType.MONEY) + pops.getResourceBalance(ResourceType.MONEY)
                if (availableMoney > 0 && requiredMoney > 0) {
                    val usedMoney = min(availableMoney, requiredMoney)
                    val amountFoodBuy = requiredFood * (usedMoney / requiredMoney)
                    pops.addResourceInput(
                        ResourceType.FOOD,
                        amountFoodBuy,
                        "buy-food"
                    )
                    pops.addResourceOutput(
                        ResourceType.MONEY,
                        usedMoney,
                        "buy-food"
                    )
                }
            }
        }
    }

}