package de.ruegnerlukas.strategygame.backend.economy.core.elements.entities

import de.ruegnerlukas.strategygame.backend.common.models.Building
import de.ruegnerlukas.strategygame.backend.common.models.City
import de.ruegnerlukas.strategygame.backend.common.models.ResourceCollection
import de.ruegnerlukas.strategygame.backend.economy.core.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.economy.core.data.EconomyNode

class BuildingEconomyEntity(private val owner: EconomyNode, val city: City, val building: Building) : EconomyEntity {

    private val providedResources = ResourceCollection.basic()
    private var hasProduced = false

    override fun getNode(): EconomyNode = owner

    override fun getPriority(): Float = if (city.isProvinceCapital) 1.5f else 1f

    override fun getRequires(): ResourceCollection = getRemainingRequiredResources()

    override fun getProduces(): ResourceCollection = ResourceCollection.basic(building.type.templateData.produces)

    override fun allowPartialConsumption(): Boolean = false

    override fun isInactive(): Boolean = !fulfillsTileRequirement(building)

    override fun isReadyToConsume(): Boolean = getRemainingRequiredResources().isNotEmpty()

    override fun isReadyToProduce(): Boolean = getRemainingRequiredResources().isEmpty() && !hasProduced

    override fun hasProduced(): Boolean = hasProduced

    override fun provideResources(resources: ResourceCollection) {
        providedResources.add(resources)
    }

    override fun flagProduced() {
        hasProduced = true
    }

    private fun fulfillsTileRequirement(building: Building): Boolean {
        return building.type.templateData.requiredTileResource == null || building.tile != null
    }

    private fun getRemainingRequiredResources(): ResourceCollection {
        return ResourceCollection.basic(building.type.templateData.requires)
            .sub(providedResources)
            .trim()
    }

}