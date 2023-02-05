package de.ruegnerlukas.strategygame.backend.ports.models

class ResourceStats {

	companion object {

		fun from(values: Map<ResourceType, Number>): ResourceStats {
			return ResourceStats().also { stats ->
				values.forEach { (type, amount) ->
					stats.set(type, amount.toFloat())
				}
			}
		}

	}

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

	fun set(type: ResourceType, amount: Float) {
		resources[type] = amount
	}

	fun clear(type: ResourceType) {
		resources.remove(type)
	}

	fun clear() {
		resources.clear()
	}

	fun toMap(): Map<ResourceType, Float> {
		return resources.toMap()
	}

}