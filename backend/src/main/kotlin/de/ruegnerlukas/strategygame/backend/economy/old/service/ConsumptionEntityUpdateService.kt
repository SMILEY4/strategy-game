package de.ruegnerlukas.strategygame.backend.economy.old.service

import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType
import de.ruegnerlukas.strategygame.backend.common.models.resources.amount
import de.ruegnerlukas.strategygame.backend.economy.old.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.economy.old.data.EconomyNode
import java.lang.Float.min

class ConsumptionEntityUpdateService : Logging {

    fun update(entity: EconomyEntity, currentNode: EconomyNode) {
        if (entity.allowPartialInput()) {
            updatePartial(entity, currentNode)
        } else {
            updateFixed(entity, currentNode)
        }
    }

    private fun updatePartial(entity: EconomyEntity, currentNode: EconomyNode) {
        if (allResourcesAvailable(currentNode, entity.getRequiredInput())) {
            updateFixed(entity, currentNode)
        } else {
            entity.getRequiredInput().forEach { requiredType, requiredAmount ->
                val amountAvailable = currentNode.getStorage().getAvailable(requiredType)
                val amountPossible = min(requiredAmount, amountAvailable)
                provideResources(entity, currentNode, requiredType, amountPossible)
                log().debug("[eco-update] $entity in node $currentNode consumed $amountPossible of $requiredType")
            }
        }
    }

    private fun updateFixed(entity: EconomyEntity, currentNode: EconomyNode) {
        if (allResourcesAvailable(currentNode, entity.getRequiredInput())) {
            provideResources(entity, currentNode, entity.getRequiredInput())
            log().debug("[eco-update] $entity in node $currentNode consumed ${entity.getRequiredInput().toList()}")
        }
    }

    private fun provideResources(entity: EconomyEntity, currentNode: EconomyNode, type: ResourceType, amount: Float) {
        provideResources(entity, currentNode, ResourceCollection.basic(type.amount(amount)))
    }

    private fun provideResources(entity: EconomyEntity, currentNode: EconomyNode, resources: ResourceCollection) {
        currentNode.getStorage().remove(resources)
        if (currentNode != entity.getNode()) {
            entity.getNode().getStorage().removedFromSharedStorage(resources)
        }
        entity.addResources(resources)
    }


    private fun allResourcesAvailable(node: EconomyNode, resources: ResourceCollection): Boolean {
        return resources.all { type, amount -> node.getStorage().getAvailable(type) >= amount }
    }

}