package de.ruegnerlukas.strategygame.backend.core.economy.service

import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceCollection
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType
import de.ruegnerlukas.strategygame.backend.ports.models.amount
import java.lang.Float.min

class ConsumptionEntityUpdateService {

    fun update(entity: EconomyEntity, currentNode: EconomyNode) {
        if (entity.allowPartialConsumption()) {
            updatePartial(entity, currentNode)
        } else {
            updateFixed(entity, currentNode)
        }
    }

    private fun updatePartial(entity: EconomyEntity, currentNode: EconomyNode) {
        if (allResourcesAvailable(currentNode, entity.getRequires())) {
            updateFixed(entity, currentNode)
        } else {
            entity.getRequires().forEach { requiredType, requiredAmount ->
                val amountAvailable = currentNode.getStorage().getAvailable(requiredType)
                val amountPossible = min(requiredAmount, amountAvailable)
                provideResources(entity, currentNode, requiredType, amountPossible)
            }
        }
    }

    private fun updateFixed(entity: EconomyEntity, currentNode: EconomyNode) {
        if (allResourcesAvailable(currentNode, entity.getRequires())) {
            provideResources(entity, currentNode, entity.getRequires())
        }
    }

    private fun provideResources(entity: EconomyEntity, currentNode: EconomyNode, resources: ResourceCollection) {
        currentNode.getStorage().remove(resources)
        if (currentNode != entity.getNode()) {
            entity.getNode().getStorage().removedFromSharedStorage(resources)
        }
        entity.provideResources(resources)
    }

    private fun provideResources(entity: EconomyEntity, currentNode: EconomyNode, type: ResourceType, amount: Float) {
        provideResources(entity, currentNode, ResourceCollection.basic(type.amount(amount)))
    }

    private fun allResourcesAvailable(node: EconomyNode, resources: ResourceCollection): Boolean {
        return resources.all { type, amount -> node.getStorage().getAvailable(type) >= amount }
    }

}