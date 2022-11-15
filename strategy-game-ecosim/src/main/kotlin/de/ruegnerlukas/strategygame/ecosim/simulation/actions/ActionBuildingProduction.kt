package de.ruegnerlukas.strategygame.ecosim.simulation.actions

import de.ruegnerlukas.strategygame.ecosim.simulation.SimAction
import de.ruegnerlukas.strategygame.ecosim.simulation.SimContext
import de.ruegnerlukas.strategygame.ecosim.simulation.Simulation
import de.ruegnerlukas.strategygame.ecosim.world.Building
import de.ruegnerlukas.strategygame.ecosim.world.PopUnit

class ActionBuildingProduction(simulation: Simulation) : SimAction(simulation) {

    override fun execute(simContext: SimContext) {
        simContext.world.cities.forEach { city ->
            city.buildings.filter { it.isStaffed }.forEach { building ->
                val popWorker = city.getPop(building.reqWorkerType)
                handle(building, popWorker)
            }
        }
    }

    private fun handle(building: Building, worker: PopUnit) {
        building.production.forEach { (resource, amount) ->
            println("produce ${amount}x ${resource} from ${building.type}")
            worker.addResourceIn(resource, amount.toFloat(), "production.${building.type}")
        }
    }

}