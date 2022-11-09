package de.ruegnerlukas.strategygame.ecosim.utils

import java.util.NavigableMap
import java.util.Random
import java.util.TreeMap

class WeightedCollection<E> {
	private val map: NavigableMap<Double, E> = TreeMap()
	private var totalWeight: Double = 0.0

	fun add(weight: Double, element: E): WeightedCollection<E> {
		if (weight > 0) {
			totalWeight += weight
			map[totalWeight] = element
		}
		return this
	}

	fun chooseRandom(random: Random): E {
		val value = random.nextDouble() * totalWeight
		return map.higherEntry(value).value
	}

}