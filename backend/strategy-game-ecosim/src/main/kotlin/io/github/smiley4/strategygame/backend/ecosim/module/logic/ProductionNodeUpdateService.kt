package io.github.smiley4.strategygame.backend.ecosim.module.logic

import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyUpdateState
import io.github.smiley4.strategygame.backend.ecosim.module.report.EconomyReportImpl

internal class ProductionNodeUpdateService(private val productionEntityUpdateService: ProductionEntityUpdateService) {

    fun update(node: EconomyNode, report: EconomyReportImpl) {
        updateChildren(node, report)
        updateEntities(node, report)
    }

    private fun updateChildren(node: EconomyNode, report: EconomyReportImpl) {
        node.children.forEach { update(it, report) }
    }

    private fun updateEntities(node: EconomyNode, report: EconomyReportImpl) {
        node.entities
            .filter { it.config.isActive }
            .filter { it.state.state == EconomyUpdateState.PRODUCE }
            .sortedByDescending { it.config.priority }
            .forEach { productionEntityUpdateService.update(it, report) }
    }

}