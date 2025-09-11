package io.github.smiley4.strategygame.backend.ecosim.application.logic

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyReport
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyUpdateState

internal class ProductionNodeUpdateService(private val productionEntityUpdateService: ProductionEntityUpdateService): Logging {

    fun update(node: EconomyNode, report: EconomyReport) {
        updateChildren(node, report)
        updateEntities(node, report)
    }

    private fun updateChildren(node: EconomyNode, report: EconomyReport) {
        node.children.forEach { update(it, report) }
    }

    private fun updateEntities(node: EconomyNode, report: EconomyReport) {
        log().debug("Updating entity production in node $node")
        node.entities
            .filter { it.config.isActive }
            .filter { it.state.state == EconomyUpdateState.PRODUCE }
            .sortedByDescending { it.config.priority }
            .forEach { productionEntityUpdateService.update(it, report) }
    }

}