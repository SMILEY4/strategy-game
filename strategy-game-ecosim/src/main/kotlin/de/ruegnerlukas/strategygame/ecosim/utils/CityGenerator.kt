package de.ruegnerlukas.strategygame.ecosim.utils

import de.ruegnerlukas.strategygame.ecosim.world.ResourceType
import java.util.Random

class CityGenerator {

    private val random = Random()

    private val AVAILABLE_FOCUSES = WeightedCollection<ResourceType>().also {
        it.add(5.0, ResourceType.FOOD)
        it.add(3.0, ResourceType.WOOD)
        it.add(3.0, ResourceType.STONE)
        it.add(2.0, ResourceType.METAL)
        it.add(3.0, ResourceType.MATERIAL)
        it.add(2.0, ResourceType.WEAPONS)
        it.add(2.0, ResourceType.JEWELLERIES)
    }

    fun pickFocuses(): Map<ResourceType, Double> {
        val pickedFocuses = mutableMapOf<ResourceType, Double>()
        for (i in 1..5) {
            AVAILABLE_FOCUSES.chooseRandom(random).let { focus ->
                pickedFocuses.computeIfAbsent(focus) { 0.0 }
                pickedFocuses[focus] = pickedFocuses[focus]?.plus(1.0) ?: 0.0
            }
        }
        return pickedFocuses.map { (key, value) -> key to value*value  }.toMap()
    }


}