package de.ruegnerlukas.strategygame.ecosim.simulation.actions

import de.ruegnerlukas.strategygame.ecosim.simulation.SimAction
import de.ruegnerlukas.strategygame.ecosim.simulation.SimContext
import de.ruegnerlukas.strategygame.ecosim.simulation.Simulation
import de.ruegnerlukas.strategygame.ecosim.world.City
import kotlin.math.exp

class ActionCityStats(simulation: Simulation) : SimAction(simulation) {

    override fun execute(simContext: SimContext) {
        simContext.world.cities.forEach { city ->
            calcOverpopulationModifier(city)
        }
    }

    private fun calcOverpopulationModifier(city: City) {
        val popCount = city.population.sumOf { it.amount }.toDouble()
        city.overpopulationModifier = (f(popCount, 0.4, 8.0, 0.6) * 10.0).toInt().toFloat() / 10f
    }

    private fun f(size: Double, spread: Double, shift: Double, max: Double): Double {
        return (1.0 / (1.0 + exp(-(size - shift) * spread))) * max
    }


}