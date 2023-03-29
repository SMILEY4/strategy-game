package de.ruegnerlukas.strategygame.backend.core.economy.elements.entities

import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.ports.models.ProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceCollection

class ProductionQueueEconomyEntity(private val owner: EconomyNode, val queueEntry: ProductionQueueEntry) : EconomyEntity {

    private val providedResources = ResourceCollection.basic()
    private var hasProduced = false

    override fun getNode(): EconomyNode = owner

    override fun getPriority(): Float = 0.5f

    override fun getRequires(): ResourceCollection = getRemainingRequiredResources()

    override fun getProduces(): ResourceCollection = ResourceCollection.basic()

    override fun allowPartialConsumption(): Boolean = true

    override fun isInactive(): Boolean = false

    override fun isReadyToConsume(): Boolean = getRemainingRequiredResources().isNotEmpty()

    override fun isReadyToProduce(): Boolean = !hasProduced

    override fun hasProduced(): Boolean = hasProduced

    override fun provideResources(resources: ResourceCollection) {
        providedResources.add(resources)
    }

    fun getProvidedResources(): ResourceCollection = providedResources

    override fun flagProduced() {
        hasProduced = true
    }

    private fun getRemainingRequiredResources(): ResourceCollection {
        return queueEntry.getTotalRequiredResources().copy()
            .sub(queueEntry.collectedResources)
            .sub(providedResources)
            .trim()
    }

}