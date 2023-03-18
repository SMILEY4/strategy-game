package de.ruegnerlukas.strategygame.backend.core.economy.service

import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStack
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
            entity.getRequires().forEach { required ->
                val amountRequired = required.amount
                val amountAvailable = currentNode.getStorage().getAvailable(required.type)
                val amountPossible = min(amountRequired, amountAvailable)
                entity.provideResources(listOf(ResourceStack(required.type, amountPossible)))
            }
        }
    }

    private fun updateFixed(entity: EconomyEntity, currentNode: EconomyNode) {
        if (allResourcesAvailable(currentNode, entity.getRequires())) {
            entity.getRequires().forEach { required ->
                currentNode.getStorage().remove(required.type, required.amount)
                if (currentNode != entity.getNode()) {
                    entity.getNode().getStorage().removedFromSharedStorage(required.type, required.amount)
                }
                entity.provideResources(listOf(ResourceStack(required.type, required.amount)))
            }
        }
    }

    private fun allResourcesAvailable(node: EconomyNode, resources: Collection<ResourceStack>): Boolean {
        return resources.all { node.getStorage().getAvailable(it.type) >= it.amount }
    }

}