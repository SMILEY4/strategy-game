package io.github.smiley4.strategygame.backend.ecosim.logic

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.models.resources.ResourceCollection
import io.github.smiley4.strategygame.backend.ecosim.data.EconomyConsumptionType
import io.github.smiley4.strategygame.backend.ecosim.data.EconomyEntity
import io.github.smiley4.strategygame.backend.ecosim.data.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.report.EconomyReport
import java.lang.Float.min

class ConsumptionEntityUpdateService : Logging {

    fun update(entity: EconomyEntity, currentNode: EconomyNode, report: EconomyReport) {
        when (entity.config.consumptionType) {
            EconomyConsumptionType.DISTRIBUTED -> updateDistributed(entity, currentNode, report)
            EconomyConsumptionType.COMPLETE -> updateLocal(entity, currentNode, report)
        }
    }

    private fun updateDistributed(entity: EconomyEntity, currentNode: EconomyNode, report: EconomyReport) {
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

    private fun updateLocal(entity: EconomyEntity, currentNode: EconomyNode, report: EconomyReport) {
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
        report: EconomyReport
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