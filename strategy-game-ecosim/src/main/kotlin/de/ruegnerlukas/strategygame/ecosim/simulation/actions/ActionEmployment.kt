package de.ruegnerlukas.strategygame.ecosim.simulation.actions

import de.ruegnerlukas.strategygame.ecosim.simulation.SimAction
import de.ruegnerlukas.strategygame.ecosim.simulation.SimContext
import de.ruegnerlukas.strategygame.ecosim.simulation.Simulation
import de.ruegnerlukas.strategygame.ecosim.world.City
import de.ruegnerlukas.strategygame.ecosim.world.PopType

class ActionEmployment(simulation: Simulation) : SimAction(simulation) {

    override fun execute(simContext: SimContext) {
        simContext.world.cities.forEach { city ->
            val freePops = PopType.values().associateWith { city.getPop(it).amount }.toMutableMap()
            employPops(freePops, city)
        }
    }

    private fun employPops(freePops: MutableMap<PopType, Int>, city: City) {
        city.buildings.forEach { building ->
            if (freePops[building.reqWorkerType]!! >= building.reqWorkerAmount) {
                freePops[building.reqWorkerType] = freePops[building.reqWorkerType]!! - building.reqWorkerAmount
                building.isStaffed = true
            } else {
                building.isStaffed = false
            }
        }
    }

}