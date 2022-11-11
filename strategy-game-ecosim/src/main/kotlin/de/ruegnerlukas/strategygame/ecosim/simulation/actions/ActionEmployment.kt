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
            employReadyPops(freePops, city)
            employSubsistencePops(freePops, city)
            handleUnemployedPops(freePops, city)
        }
    }

    private fun employReadyPops(freePops: MutableMap<PopType, Int>, city: City) {
        city.buildings.forEach { building ->
            if (freePops[building.reqWorkerType]!! >= building.reqWorkerAmount) {
                freePops[building.reqWorkerType] = freePops[building.reqWorkerType]!! - building.reqWorkerAmount
                building.isStaffed = true
            } else {
                building.isStaffed = false
            }
        }
    }

    private fun employSubsistencePops(freePops: MutableMap<PopType, Int>, city: City) {
        city.buildings.filter { !it.isStaffed }.forEach { building ->
            if (freePops[PopType.SUBSISTENCE_FARMER]!! >= building.reqWorkerAmount) {
                freePops[PopType.SUBSISTENCE_FARMER] = freePops[PopType.SUBSISTENCE_FARMER]!! - building.reqWorkerAmount
                city.modifyPopAmount(PopType.SUBSISTENCE_FARMER, -building.reqWorkerAmount)
                city.modifyPopAmount(building.reqWorkerType, building.reqWorkerAmount)
                building.isStaffed = true
            } else {
                building.isStaffed = false
            }
        }
    }

    private fun handleUnemployedPops(freePops: MutableMap<PopType, Int>, city: City) {
        freePops.filter { it.value > 0 }.forEach { (type, amount) ->
            city.modifyPopAmount(type, -amount)
            city.modifyPopAmount(PopType.SUBSISTENCE_FARMER, amount)
        }
    }

}