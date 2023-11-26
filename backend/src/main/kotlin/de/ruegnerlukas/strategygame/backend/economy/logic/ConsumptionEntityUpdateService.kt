package de.ruegnerlukas.strategygame.backend.economy.logic

import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyConsumptionType
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.economy.report.EconomyUpdateReport
import java.lang.Float.min

class ConsumptionEntityUpdateService : Logging {

    fun update(entity: EconomyEntity, currentNode: EconomyNode, report: EconomyUpdateReport) {
        when (entity.config.consumptionType) {
            EconomyConsumptionType.DISTRIBUTED -> updateDistributed(entity, currentNode, report)
            EconomyConsumptionType.COMPLETE -> updateLocal(entity, currentNode, report)
        }
    }

    private fun updateDistributed(entity: EconomyEntity, currentNode: EconomyNode, report: EconomyUpdateReport) {
        val requiredResources = entity.state.getRemainingRequired()
        if (allResourcesAvailable(currentNode, requiredResources)) {
            updateLocal(entity, currentNode, report)
        } else {
            val resources = getPossibleResources(requiredResources, currentNode)
            provideResources(entity, currentNode, resources, report)
        }
    }

    private fun getPossibleResources(required: ResourceCollection, node: EconomyNode): ResourceCollection {
        val resources = ResourceCollection.basic()
        required.forEach { requiredType, requiredAmount ->
            val amountAvailable = node.storage.getAvailable(requiredType)
            val amountPossible = min(requiredAmount, amountAvailable)
            resources.add(requiredType, amountPossible)
        }
        return resources
    }

    private fun updateLocal(entity: EconomyEntity, currentNode: EconomyNode, report: EconomyUpdateReport) {
        val requiredResources = entity.state.getRemainingRequired()
        if (allResourcesAvailable(currentNode, requiredResources)) {
            provideResources(entity, currentNode, requiredResources, report)
        }
    }

    private fun allResourcesAvailable(node: EconomyNode, resources: ResourceCollection): Boolean {
        return resources.all { type, amount -> node.storage.getAvailable(type) >= amount }
    }

    private fun provideResources(
        entity: EconomyEntity,
        currentNode: EconomyNode,
        resources: ResourceCollection,
        report: EconomyUpdateReport
    ) {
        log().debug("[eco-update] $entity in node $currentNode consumed ${resources.toList()} (requires ${entity.state.getRemainingRequired()})")
        report.addConsumption(
            entity = entity,
            fromNode = currentNode,
            resources = resources.copy()
        )
        currentNode.storage.remove(resources)
        entity.state.consume(resources)
    }


}