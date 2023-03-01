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

        fun from(stats: ResourceStats): ResourceStats {
            return ResourceStats().also {
                stats.resources.forEach { (type, amount) ->
                    it.set(type, amount)
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

    fun add(resources: ResourceStats) {
        resources.toList().forEach { (type, amount) ->
            add(type, amount)
        }
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

    fun toList(): List<Pair<ResourceType, Float>> {
        return resources.entries.map { it.key to it.value }
    }

    fun toDebugString(): String {
        return "ResourceStats:" +
                System.lineSeparator() +
                resources.entries.joinToString(separator = System.lineSeparator()) { " - ${it.key} = ${it.value}" }
    }

}