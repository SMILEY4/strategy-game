package io.github.smiley4.strategygame.backend.commondata

class ResourceStorage {

    private val resources = ResourceType.entries.associateWith { 0.0 }.toMutableMap()

    constructor()

    constructor(values: Map<ResourceType, Double>) {
        resources.putAll(values)
    }

    fun getAmount(type: ResourceType): Double {
        return resources.getOrDefault(type, 0.0)
    }

    fun hasAmount(type: ResourceType, required: Double): Boolean {
        return getAmount(type) >= required
    }


    fun store(type: ResourceType, amount: Double) {
        resources[type] = resources.getOrDefault(type, 0.0) + amount
    }

    fun retrieve(type: ResourceType, amount: Double) {
        resources[type] = resources.getOrDefault(type, 0.0) - amount
    }

    fun set(type: ResourceType, amount: Double) {
        resources[type] = amount
    }

    fun toMap(): Map<ResourceType, Double> {
        return resources.toMap()
    }

}