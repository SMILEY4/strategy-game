package de.ruegnerlukas.strategygame.backend.ports.models

data class MarketNode(
    val resources: Map<ResourceType, MarketNodeResource>
) {

    fun get(resourceType: ResourceType): MarketNodeResource {
        return resources[resourceType] ?: MarketNodeResource.NONE
    }

}


data class MarketNodeResource(
    val localAvailability: Float,
    val localDemand: Float,
) {

    companion object {
        val NONE = MarketNodeResource(0f, 0f)
    }

}