package de.ruegnerlukas.strategygame.backend.ports.models

class ResourceStats {

	private val resources = mutableMapOf<ResourceType, Float>()

	operator fun get(type: ResourceType): Float {
		return resources[type] ?: 0f
	}

	fun add(type: ResourceType, amount: Float) {
		resources[type] = resources[type]?.let { it + amount } ?: amount
	}

	fun remove(type: ResourceType, amount: Float) {
		add(type, -amount)
	}

}