package de.ruegnerlukas.strategygame.ecosim.simulation

import de.ruegnerlukas.strategygame.ecosim.simulation.actions.ActionBuildingProduction
import de.ruegnerlukas.strategygame.ecosim.simulation.actions.ActionBuyFood
import de.ruegnerlukas.strategygame.ecosim.simulation.actions.ActionEmployment
import de.ruegnerlukas.strategygame.ecosim.simulation.actions.ActionFoodConsumption
import de.ruegnerlukas.strategygame.ecosim.simulation.actions.ActionPopGrowth
import de.ruegnerlukas.strategygame.ecosim.simulation.actions.ActionSubsistenceProduction
import de.ruegnerlukas.strategygame.ecosim.world.World

object SimSetup {

    fun build(world: World): Simulation {

        val sim = Simulation(SimContext(0, world))

        ActionEmployment(sim)
            .on(Simulation::class)

        ActionSubsistenceProduction(sim)
            .on(ActionEmployment::class)

        ActionBuildingProduction(sim)
            .on(ActionSubsistenceProduction::class)

        ActionBuyFood(sim)
            .on(ActionBuildingProduction::class)

        ActionFoodConsumption(sim)
            .on(ActionBuildingProduction::class)

        ActionPopGrowth(sim)
            .on(ActionFoodConsumption::class)

        return sim
    }

}