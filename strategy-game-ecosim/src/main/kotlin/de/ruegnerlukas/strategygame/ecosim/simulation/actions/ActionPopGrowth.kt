package de.ruegnerlukas.strategygame.ecosim.simulation.actions

import de.ruegnerlukas.strategygame.ecosim.simulation.SimAction
import de.ruegnerlukas.strategygame.ecosim.simulation.SimContext
import de.ruegnerlukas.strategygame.ecosim.simulation.Simulation
import de.ruegnerlukas.strategygame.ecosim.world.City
import de.ruegnerlukas.strategygame.ecosim.world.PopUnit
import de.ruegnerlukas.strategygame.ecosim.world.ResourceType
import kotlin.math.min

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
        val progress = min(foodBalance / pops.amount, 0.5f) // todo: calc progress from food differently ? "food safety" instead of surplus ?
        pops.growthProgress += progress
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