package de.ruegnerlukas.strategygame.backend.core.economy.elements.entities

import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.ports.models.ProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStack
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType

class ProductionQueueEconomyEntity(private val owner: EconomyNode, val queueEntry: ProductionQueueEntry) : EconomyEntity {

    private val ownedResources = mutableListOf<ResourceStack>()
    private var hasProduced = false

    override fun getNode(): EconomyNode = owner

    override fun getPriority(): Float = 0.5f

    override fun getRequires(): Collection<ResourceStack> = getRemainingRequiredResources()

    override fun getProduces(): Collection<ResourceStack> = emptyList()

    override fun allowPartialConsumption(): Boolean = true

    override fun isInactive(): Boolean = false

    override fun isReadyToConsume(): Boolean = getRemainingRequiredResources().isNotEmpty()

    override fun isReadyToProduce(): Boolean = !hasProduced

    override fun hasProduced(): Boolean = hasProduced

    override fun provideResources(resources: Collection<ResourceStack>) {
        ownedResources.addAll(resources)
    }

    fun getProvidedResources(): Collection<ResourceStack> = ownedResources

    override fun flagProduced() {
        hasProduced = true
    }

    private fun getRemainingRequiredResources(): Collection<ResourceStack> {
        return mutableListOf<ResourceStack>().also { remaining ->
            queueEntry.getTotalRequiredResources().forEach { required ->
                val requiredAmount = required.amount - queueEntry.collectedResources[required.type]
                val ownedAmount = ownedResources
                    .filter { it.type == required.type }
                    .fold(0f) { sum, e -> sum + e.amount }
                val remainingAmount = requiredAmount - ownedAmount
                if (remainingAmount > 0.00001) {
                    remaining.add(ResourceStack(required.type, remainingAmount))
                }
            }
        }
    }

}