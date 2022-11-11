package de.ruegnerlukas.strategygame.ecosim

import de.ruegnerlukas.strategygame.ecosim.simulation.SimContext
import de.ruegnerlukas.strategygame.ecosim.simulation.Simulation
import de.ruegnerlukas.strategygame.ecosim.simulation.actions.ActionAgricultureEfficiency
import de.ruegnerlukas.strategygame.ecosim.simulation.actions.ActionFoodYield
import de.ruegnerlukas.strategygame.ecosim.simulation.actions.ActionMarketPrices
import de.ruegnerlukas.strategygame.ecosim.simulation.actions.ActionPopsGentryTaxIncome
import de.ruegnerlukas.strategygame.ecosim.simulation.actions.ActionPopsSerfDepositMoney
import de.ruegnerlukas.strategygame.ecosim.simulation.actions.ActionPopsSerfGrowth
import de.ruegnerlukas.strategygame.ecosim.simulation.actions.ActionPopsSerfsBuyFood
import de.ruegnerlukas.strategygame.ecosim.simulation.actions.ActionPopsSerfsBuyGoods
import de.ruegnerlukas.strategygame.ecosim.simulation.actions.ActionPopsFoodConsumption
import de.ruegnerlukas.strategygame.ecosim.simulation.actions.ActionPopsSerfsRawResourceProduction
import de.ruegnerlukas.strategygame.ecosim.simulation.actions.ActionPopsSerfsResourceTaxes
import de.ruegnerlukas.strategygame.ecosim.simulation.actions.ActionPopsSerfsSellFood
import de.ruegnerlukas.strategygame.ecosim.simulation.actions.ActionReset
import de.ruegnerlukas.strategygame.ecosim.world.World

object SimSetup {

    fun build(world: World): Simulation {

        val sim = Simulation(SimContext(0, world))

        ActionMarketPrices(sim)
            .on(Simulation::class)

        ActionReset(sim)
            .on(ActionMarketPrices::class)

        ActionAgricultureEfficiency(sim)
            .on(ActionReset::class)

        ActionFoodYield(sim)
            .on(ActionReset::class)

        ActionPopsSerfsRawResourceProduction(sim)
            .on(ActionFoodYield::class)

        ActionPopsSerfsResourceTaxes(sim)
            .on(ActionPopsSerfsRawResourceProduction::class)

        ActionPopsGentryTaxIncome(sim)
            .on(ActionPopsSerfsRawResourceProduction::class)

        ActionPopsFoodConsumption(sim)
            .on(ActionPopsSerfsResourceTaxes::class)

        ActionPopsSerfsSellFood(sim)
            .on(ActionPopsFoodConsumption::class)

        ActionPopsSerfsBuyFood(sim)
            .on(ActionPopsFoodConsumption::class)

        ActionPopsSerfsBuyGoods(sim)
            .on(ActionPopsSerfsBuyFood::class)

        ActionPopsSerfGrowth(sim)
            .on(ActionPopsSerfsBuyFood::class)
            .on(ActionPopsSerfsSellFood::class)

        ActionPopsSerfDepositMoney(sim)
            .on(ActionPopsSerfGrowth::class)

        return sim
    }

}