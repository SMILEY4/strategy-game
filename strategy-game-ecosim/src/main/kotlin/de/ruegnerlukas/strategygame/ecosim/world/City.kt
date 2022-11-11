package de.ruegnerlukas.strategygame.ecosim.world

import kotlin.math.max

class City(
    val name: String,
    val population: MutableList<PopUnit>,
    val buildings: MutableList<Building>
) {

    fun getPop(type: PopType): PopUnit {
        return population.find { it.type == type } ?: PopUnit(type, 0)
    }

    fun modifyPopAmount(type: PopType, change: Int) {
        val pop = population.find { it.type == type }
        if (pop == null) {
            if (change > 0) {
                population.add(PopUnit(type, change))
            }
        } else {
            pop.amount = max(0, pop.amount + change)
        }
    }

}