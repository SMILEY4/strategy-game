package de.ruegnerlukas.strategygame.ecosim.world

open class PopUnit(
    var amount: Int,
    var growthProgress: Float = 0f,
    val resourcesIn: MutableMap<ResourceType, MutableList<Pair<Float, String>>> = mutableMapOf(),
    val resourcesOut: MutableMap<ResourceType, MutableList<Pair<Float, String>>> = mutableMapOf(),
    val resourcesStored: MutableMap<ResourceType, Float> = mutableMapOf(),
) {

    fun addResourceInput(type: ResourceType, amount: Float, reason: String) {
        resourcesIn
            .computeIfAbsent(type) { mutableListOf() }
            .add(amount to reason)
    }

    fun addResourceOutput(type: ResourceType, amount: Float, reason: String) {
        resourcesOut
            .computeIfAbsent(type) { mutableListOf() }
            .add(amount to reason)
    }


    fun getResourceInput(type: ResourceType, reason: String): Float {
        return resourcesIn[type]
            ?.let { entry -> entry.find { it.second == reason } }?.first
            ?: 0f
    }

    fun getResourceOutput(type: ResourceType, reason: String): Float {
        return resourcesOut[type]
            ?.let { entry -> entry.find { it.second == reason } }?.first
            ?: 0f
    }

    fun getTotalResourceInput(type: ResourceType): Float {
        return resourcesIn
            .getOrDefault(type, listOf())
            .map { it.first }
            .sum()
    }

    fun getTotalResourceOutput(type: ResourceType): Float {
        return resourcesOut
            .getOrDefault(type, listOf())
            .map { it.first }
            .sum()
    }

    fun getResourceBalance(type: ResourceType): Float {
        return getTotalResourceInput(type) - getTotalResourceOutput(type)
    }

    fun getResourcesStored(type: ResourceType): Float {
        return resourcesStored[type] ?: 0f
    }

    fun storeResources(type: ResourceType, amount: Float) {
        resourcesStored[type] = getResourcesStored(type) + amount
    }

    fun depositResources(type: ResourceType, amount: Float) {
        resourcesStored[type] = getResourcesStored(type) - amount
    }
}

class SerfPopUnit(
    amount: Int,
    var foodTaxRate: Float,
    var foodConsumption: Float,
) : PopUnit(amount)

class FreemenPopUnit(
    amount: Int,
) : PopUnit(amount)

class GentryPopUnit(
    amount: Int,
) : PopUnit(amount)