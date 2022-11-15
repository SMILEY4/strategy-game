package de.ruegnerlukas.strategygame.ecosim.simulation

import de.ruegnerlukas.strategygame.ecosim.simulation.actions.ActionBuildingProduction
import de.ruegnerlukas.strategygame.ecosim.simulation.actions.ActionCityStats
import de.ruegnerlukas.strategygame.ecosim.simulation.actions.ActionEmployment
import de.ruegnerlukas.strategygame.ecosim.simulation.actions.ActionFoodConsumption
import de.ruegnerlukas.strategygame.ecosim.simulation.actions.ActionPopGrowth
import de.ruegnerlukas.strategygame.ecosim.simulation.actions.ActionReset
import de.ruegnerlukas.strategygame.ecosim.world.World

object SimSetup {

    fun build(world: World): Simulation {

        val sim = Simulation(SimContext(0, world))

        ActionReset(sim)
            .on(Simulation::class)

        ActionCityStats(sim)
            .on(ActionReset::class)

        ActionEmployment(sim)
            .on(ActionReset::class)

        ActionBuildingProduction(sim)
            .on(ActionEmployment::class)

        ActionFoodConsumption(sim)
            .on(ActionBuildingProduction::class)

        ActionPopGrowth(sim)
            .on(ActionFoodConsumption::class)

        return sim
    }

}