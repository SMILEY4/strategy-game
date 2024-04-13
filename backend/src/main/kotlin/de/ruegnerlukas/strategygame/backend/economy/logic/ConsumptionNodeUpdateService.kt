package de.ruegnerlukas.strategygame.backend.economy.logic

import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode.Companion.collectEntities
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyUpdateState
import de.ruegnerlukas.strategygame.backend.economy.report.EconomyReport


class ConsumptionNodeUpdateService(private val consumptionEntityUpdateService: ConsumptionEntityUpdateService) {

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
        node.collectEntities()
            .filter { it.config.isActive }
            .filter { it.state.state == EconomyUpdateState.CONSUME }
            .sortedByDescending { it.config.priority }
            .forEach { consumptionEntityUpdateService.update(it, node, report) }
    }

}