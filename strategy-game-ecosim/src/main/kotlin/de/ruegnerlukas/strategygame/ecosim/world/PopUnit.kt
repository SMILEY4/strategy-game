package de.ruegnerlukas.strategygame.ecosim.world

enum class PopType {
    SUBSISTENCE_FARMER,
    PEASANT,
    ARTISAN,
    GENTRY
}

class PopUnit(
    val type: PopType,
    var amount: Int,
    var growthProgress: Float = 0f,
    val resourcesIn: MutableMap<ResourceType, MutableList<Pair<Float, String>>> = mutableMapOf(),
    val resourcesOut: MutableMap<ResourceType, MutableList<Pair<Float, String>>> = mutableMapOf(),
) {

    fun addResourceIn(type: ResourceType, amount: Float, reason: String) {
        resourcesIn
            .computeIfAbsent(type) { mutableListOf() }
            .add(amount to reason)
    }

    fun addResourceOut(type: ResourceType, amount: Float, reason: String) {
        resourcesOut
            .computeIfAbsent(type) { mutableListOf() }
            .add(amount to reason)
    }

    fun getResourceIn(type: ResourceType, reason: String): Float {
        return resourcesIn[type]
            ?.let { entry -> entry.find { it.second == reason } }?.first
            ?: 0f
    }

    fun getResourceOut(type: ResourceType, reason: String): Float {
        return resourcesOut[type]
            ?.let { entry -> entry.find { it.second == reason } }?.first
            ?: 0f
    }

    fun getTotalResourceIn(type: ResourceType): Float {
        return resourcesIn
            .getOrDefault(type, listOf())
            .map { it.first }
            .sum()
    }

    fun getTotalResourceOut(type: ResourceType): Float {
        return resourcesOut
            .getOrDefault(type, listOf())
            .map { it.first }
            .sum()
    }

    fun getResourceBalance(type: ResourceType): Float {
        return getTotalResourceIn(type) - getTotalResourceOut(type)
    }

}