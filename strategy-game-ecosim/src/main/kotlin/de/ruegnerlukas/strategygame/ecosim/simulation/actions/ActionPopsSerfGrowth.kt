package de.ruegnerlukas.strategygame.ecosim.simulation.actions

import de.ruegnerlukas.strategygame.ecosim.simulation.SimAction
import de.ruegnerlukas.strategygame.ecosim.simulation.SimContext
import de.ruegnerlukas.strategygame.ecosim.simulation.Simulation
import de.ruegnerlukas.strategygame.ecosim.world.ResourceType
import de.ruegnerlukas.strategygame.ecosim.world.SerfPopUnit

class ActionPopsSerfGrowth(simulation: Simulation) : SimAction(simulation) {

    override fun execute(simContext: SimContext) {
        simContext.world.cities.forEach { city ->
            val popsSerfs = city.getPop<SerfPopUnit>()
            if (popsSerfs.amount > 0) {
                timedChange(popsSerfs)
            }
        }
    }


    private fun timedChange(pops: SerfPopUnit) {
        if (pops.getResourceBalance(ResourceType.FOOD) > 0) {
            pops.growthProgress += pops.amount.toFloat() * 0.01f
            if (pops.growthProgress > 1f) {
                pops.growthProgress = 0f
                pops.amount += 1
            }
        }
        if (pops.getResourceBalance(ResourceType.FOOD) < 0) {
            pops.growthProgress -= pops.amount.toFloat() * 0.05f
            if (pops.growthProgress < -1f) {
                pops.growthProgress = 0f
                pops.amount -= 1
            }
        }

    }

//    private fun deterministicChange(pops: SerfPopUnit) {
//        var change = 0
//        if (pops.getResourceBalance(ResourceType.FOOD) > 0 && pops.popChangeLastStep != -1) {
//            change = +1
//        }
//        if (pops.getResourceBalance(ResourceType.FOOD) < 0 && pops.popChangeLastStep != +1) {
//            change = -1
//        }
//        pops.amount += change
//        pops.popChangeLastStep = change
//    }

//    private fun randomChange(pops: SerfPopUnit) {
//        if (pops.getResourceBalance(ResourceType.FOOD) >= 0) {
//            pops.amount += if (random() < 0.6) 1 else 0
//        }
//        if (pops.getResourceBalance(ResourceType.FOOD) < 0) {
//            pops.amount -= if (random() < 0.8) 1 else 0
//        } else {
//            pops.amount -= if (random() < 0.5) 1 else 0
//        }
//    }

}