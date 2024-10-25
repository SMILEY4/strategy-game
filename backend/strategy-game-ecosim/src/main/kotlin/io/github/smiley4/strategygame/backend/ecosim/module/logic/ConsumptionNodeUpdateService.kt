package io.github.smiley4.strategygame.backend.ecosim.module.logic

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNode.Companion.collectEntities
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyReport
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyUpdateState


internal class ConsumptionNodeUpdateService(private val consumptionEntityUpdateService: ConsumptionEntityUpdateService) : Logging {

    fun update(node: EconomyNode, report: EconomyReport) {
        updateChildren(node, report)
        updateNodeStorage(node)
        updateEntities(node, report)
    }

    private fun updateChildren(node: EconomyNode, report: EconomyReport) {
        node.children.forEach { update(it, report) }
    }

    private fun updateNodeStorage(node: EconomyNode) {
        node.storage.revertToInitial()
        node.children.forEach { node.storage.merge(it.storage) }
    }

    private fun updateEntities(node: EconomyNode, report: EconomyReport) {
        log().debug("Updating entity consumption in node $node")
        node.collectEntities()
            .filter { it.config.isActive }
            .filter { it.state.state == EconomyUpdateState.CONSUME }
            .sortedByDescending { it.config.priority }
            .forEach { consumptionEntityUpdateService.update(it, node, report) }
    }

}