package de.ruegnerlukas.strategygame.ecosim.simulation.actions

import de.ruegnerlukas.strategygame.ecosim.simulation.SimAction
import de.ruegnerlukas.strategygame.ecosim.simulation.SimContext
import de.ruegnerlukas.strategygame.ecosim.simulation.Simulation
import de.ruegnerlukas.strategygame.ecosim.world.ResourceType
import java.lang.Math.pow
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min
import kotlin.math.pow

class ActionMarketPrices(simulation: Simulation) : SimAction(simulation) {

    override fun execute(simContext: SimContext) {
        simContext.world.cities.forEach { city ->
            ResourceType.values().forEach { type ->
                val demand = abs(city.market.getTotalResourceOutput(type))
                val supply = abs(city.market.getTotalResourceInput(type))
                val prevPrice = city.market.getResourcePriceModifier(type)
                if (type == ResourceType.FOOD) {
                    println("demand/supply/prev/mod => $demand vs $supply: $prevPrice -> ${f(prevPrice, supply, demand)}")
                }
                city.market.setResourcePriceModifier(type, f(prevPrice, supply, demand))
            }
        }
    }

//    private fun f(prevPrice: Float, supply: Float, demand: Float): Float {
//        val change = 0.1f
//        val target = if(almostZero(supply) && almostZero(demand)) {
//            1f
//        } else if(supply > demand) {
//            prevPrice - change
//        } else { // demand < supply
//            prevPrice + change
//        }
//        return lerp(prevPrice, target, 0.5f)
//    }

    private fun f(prevPrice: Float, supply: Float, demand: Float): Float {
        val minMod = 0.25f
        val maxMod = 1.75f
        val target = if (supply > 0f && demand > 0f) {
            limit((demand / supply).pow(6f), minMod, maxMod)
        } else if (almostZero(supply) && almostZero(demand)) {
            1f
        } else {
            if (almostZero(supply)) 1.75f else 0.25f
        }
        return lerp(prevPrice, target, 0.5f)
    }

    private fun limit(x: Float, a: Float, b: Float): Float {
        return max(a, min(x, b))
    }

    private fun almostZero(x: Float): Boolean {
        return abs(x) < 0.0000001f
    }

    fun lerp(a: Float, b: Float, f: Float): Float {
        return (a * (1.0 - f) + b * f).toFloat()
    }

}