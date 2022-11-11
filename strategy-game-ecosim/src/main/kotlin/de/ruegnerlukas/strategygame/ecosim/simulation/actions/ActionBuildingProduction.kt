package de.ruegnerlukas.strategygame.ecosim.simulation.actions

import de.ruegnerlukas.strategygame.ecosim.simulation.SimAction
import de.ruegnerlukas.strategygame.ecosim.simulation.SimContext
import de.ruegnerlukas.strategygame.ecosim.simulation.Simulation
import de.ruegnerlukas.strategygame.ecosim.world.PopType

class ActionBuildingProduction(simulation: Simulation) : SimAction(simulation) {

    override fun execute(simContext: SimContext) {
        simContext.world.cities.forEach { city ->
            city.buildings.filter { it.isStaffed }.forEach { building ->
                val popWorker = city.getPop(building.reqWorkerType)
                val popGentry = city.getPop(PopType.GENTRY)
                if (popGentry.amount > 0) {
                    building.incomeWorker.forEach { (resource, amount) ->
                        popWorker.addResourceIn(resource, amount.toFloat(), "production.${building.type}")
                    }
                    building.incomeGentry.forEach { (resource, amount) ->
                        popGentry.addResourceIn(resource, amount.toFloat(), "production.${building.type}")
                    }
                } else {
                    building.incomeWorkerFull.forEach { (resource, amount) ->
                        popWorker.addResourceIn(resource, amount.toFloat(), "production.${building.type}")
                    }
                }
            }
        }
    }

}