package de.ruegnerlukas.strategygame.backend.common

fun <E> Collection<E>.max(valueProvider: (e: E) -> Number): E? {
	if(this.isEmpty()) {
		return null
	} else {
		var maxValue: Double? = null
		var maxElement: E? = null
		this.forEach { e ->
			val value = valueProvider(e).toDouble()
			if(maxValue == null || maxValue!! < value) {
				maxElement = e
				maxValue = value
			}
		}
		return maxElement
	}
}

fun <E> Collection<E>.min(valueProvider: (e: E) -> Number): E? {
	if(this.isEmpty()) {
		return null
	} else {
		var minValue: Double? = null
		var minElement: E? = null
		this.forEach { e ->
			val value = valueProvider(e).toDouble()
			if(minValue == null || minValue!! > value) {
				minElement = e
				minValue = value
			}
		}
		return minElement
	}
}