package de.ruegnerlukas.strategygame.ecosim.world

data class Market(
    val resourcesIn: MutableMap<ResourceType, MutableList<Pair<Float, String>>> = mutableMapOf(),
    val resourcesOut: MutableMap<ResourceType, MutableList<Pair<Float, String>>> = mutableMapOf(),
    val priceModifier: MutableMap<ResourceType, Float> = ResourceType.values().associateWith { 1f }.toMutableMap()
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

    fun setResourcePriceModifier(type: ResourceType, modifier: Float) {
        priceModifier[type] = modifier
    }

    fun getResourcePriceModifier(type: ResourceType): Float {
        return priceModifier.getOrDefault(ResourceType.FOOD, 1f)
    }

}