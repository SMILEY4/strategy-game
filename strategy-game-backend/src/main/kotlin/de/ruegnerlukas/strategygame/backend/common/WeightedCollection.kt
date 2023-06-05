package de.ruegnerlukas.strategygame.backend.common

import java.util.NavigableMap
import java.util.TreeMap
import kotlin.random.Random

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