package de.ruegnerlukas.strategygame.backend.economy.logic

import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType
import de.ruegnerlukas.strategygame.backend.common.models.resources.amount
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyConsumptionType
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode
import java.lang.Float.min

class ConsumptionEntityUpdateService : Logging {

    fun update(entity: EconomyEntity, currentNode: EconomyNode) {
        when(entity.config.consumptionType) {
            EconomyConsumptionType.DISTRIBUTED -> updateDistributed(entity, currentNode)
            EconomyConsumptionType.LOCAL -> updateLocal(entity, currentNode)
        }
    }

    private fun updateDistributed(entity: EconomyEntity, currentNode: EconomyNode) {
        val requiredResources = entity.state.getRemainingRequired()
        if (allResourcesAvailable(currentNode, requiredResources)) {
            updateLocal(entity, currentNode)
        } else {
            requiredResources.forEach { requiredType, requiredAmount ->
                val amountAvailable = currentNode.storage.getAvailable(requiredType)
                val amountPossible = min(requiredAmount, amountAvailable)
                provideResources(entity, currentNode, requiredType, amountPossible)
                log().debug("[eco-update] $entity in node $currentNode consumed $amountPossible of $requiredType")
            }
        }
    }

    private fun updateLocal(entity: EconomyEntity, currentNode: EconomyNode) {
        val requiredResources = entity.state.getRemainingRequired()
        if (allResourcesAvailable(currentNode, requiredResources)) {
            provideResources(entity, currentNode, requiredResources)
            log().debug("[eco-update] $entity in node $currentNode consumed ${requiredResources.toList()}")
        }
    }

    private fun provideResources(entity: EconomyEntity, currentNode: EconomyNode, type: ResourceType, amount: Float) {
        provideResources(entity, currentNode, ResourceCollection.basic(type.amount(amount)))
    }

    private fun provideResources(entity: EconomyEntity, currentNode: EconomyNode, resources: ResourceCollection) {
        currentNode.storage.remove(resources)
        entity.state.consume(resources)
    }

    private fun allResourcesAvailable(node: EconomyNode, resources: ResourceCollection): Boolean {
        return resources.all { type, amount -> node.storage.getAvailable(type) >= amount }
    }

}