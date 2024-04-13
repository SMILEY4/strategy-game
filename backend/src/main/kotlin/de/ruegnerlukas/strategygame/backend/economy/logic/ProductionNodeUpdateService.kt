package de.ruegnerlukas.strategygame.backend.economy.logic

import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyUpdateState
import de.ruegnerlukas.strategygame.backend.economy.report.EconomyReport

class ProductionNodeUpdateService(private val productionEntityUpdateService: ProductionEntityUpdateService) {

    fun update(node: EconomyNode, report: EconomyReport) {
        updateChildren(node, report)
        updateEntities(node, report)
    }

    private fun updateChildren(node: EconomyNode, report: EconomyReport) {
        node.children.forEach { update(it, report) }
    }

    private fun updateEntities(node: EconomyNode, report: EconomyReport) {
        node.entities
            .filter { it.config.isActive }
            .filter { it.state.state == EconomyUpdateState.PRODUCE }
            .sortedByDescending { it.config.priority }
            .forEach { productionEntityUpdateService.update(it, report) }
    }

}