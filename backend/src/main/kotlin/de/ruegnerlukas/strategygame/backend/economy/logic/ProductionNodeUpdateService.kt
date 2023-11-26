package de.ruegnerlukas.strategygame.backend.economy.logic

import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyUpdateState
import de.ruegnerlukas.strategygame.backend.economy.report.EconomyUpdateReport

class ProductionNodeUpdateService(private val productionEntityUpdateService: ProductionEntityUpdateService) {

    fun update(node: EconomyNode, report: EconomyUpdateReport) {
        updateChildren(node, report)
        updateEntities(node, report)
    }

    private fun updateChildren(node: EconomyNode, report: EconomyUpdateReport) {
        node.children.forEach { update(it, report) }
    }

    private fun updateEntities(node: EconomyNode, report: EconomyUpdateReport) {
        node.entities
            .filter { it.config.isActive }
            .filter { it.state.state == EconomyUpdateState.PRODUCE }
            .sortedByDescending { it.config.priority }
            .forEach { productionEntityUpdateService.update(it, report) }
    }

}