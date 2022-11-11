package de.ruegnerlukas.strategygame.ecosim.simulation.actions

import de.ruegnerlukas.strategygame.ecosim.simulation.SimAction
import de.ruegnerlukas.strategygame.ecosim.simulation.SimContext
import de.ruegnerlukas.strategygame.ecosim.simulation.Simulation
import de.ruegnerlukas.strategygame.ecosim.world.City
import de.ruegnerlukas.strategygame.ecosim.world.PopUnit
import de.ruegnerlukas.strategygame.ecosim.world.ResourceType

class ActionPopGrowth(simulation: Simulation) : SimAction(simulation) {

    override fun execute(simContext: SimContext) {
        simContext.world.cities.forEach { city ->
            city.population.filter { it.amount > 0 }.forEach { pops ->
                calcProgress(pops)
                calcGrowth(pops, city)
            }
        }
    }

    private fun calcProgress(pops: PopUnit) {
        val foodBalance = pops.getResourceBalance(ResourceType.FOOD)
        pops.growthProgress += foodBalance / pops.amount
    }

    private fun calcGrowth(pops: PopUnit, city: City) {
        if (pops.growthProgress >= +1f) {
            city.modifyPopAmount(pops.type, +1)
            pops.growthProgress = 0f
        } else if (pops.growthProgress <= -1f) {
            city.modifyPopAmount(pops.type, -1)
            pops.growthProgress = 0f
        }
    }

}