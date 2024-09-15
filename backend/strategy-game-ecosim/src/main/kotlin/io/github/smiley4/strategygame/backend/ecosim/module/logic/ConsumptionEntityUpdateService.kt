package io.github.smiley4.strategygame.backend.ecosim.module.logic

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.commondata.ResourceCollection
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyConsumptionType
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyEntity
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyReport
import java.lang.Float.min

internal class ConsumptionEntityUpdateService : Logging {

    fun update(entity: EconomyEntity, currentNode: EconomyNode, report: EconomyReport) {
        log().debug("Updating consumption of entity $entity")
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

    private fun updateLocal(entity: EconomyEntity, currentNode: EconomyNode, report: EconomyReport) {
        val requiredResources = entity.state.getRemainingRequired()
        if (allResourcesAvailable(currentNode, requiredResources)) {
            provideResources(entity, currentNode, requiredResources, report)
        } else {
            log().debug("$currentNode could not provide required resources for $entity (requires: $requiredResources,available=${currentNode.storage.getAvailable().toList()})")
        }
    }

    private fun allResourcesAvailable(node: EconomyNode, resources: ResourceCollection): Boolean {
        return resources.all { type, amount -> node.storage.getAvailable(type) >= amount }
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

    private fun provideResources(
        entity: EconomyEntity,
        currentNode: EconomyNode,
        resources: ResourceCollection,
        report: EconomyReport
    ) {
        log().debug("$entity in node $currentNode consumed ${resources.toList()} (requires ${entity.state.getRemainingRequired().toList()})")
        report.addConsumption(
            entity = entity,
            fromNode = currentNode,
            resources = resources.copy()
        )
        currentNode.storage.remove(resources)
        entity.state.consume(resources)
    }


}