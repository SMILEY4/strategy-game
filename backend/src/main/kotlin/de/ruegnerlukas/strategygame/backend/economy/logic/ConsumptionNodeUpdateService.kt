package de.ruegnerlukas.strategygame.backend.economy.logic

import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode.Companion.collectEntities
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyUpdateState


class ConsumptionNodeUpdateService(private val consumptionEntityUpdateService: ConsumptionEntityUpdateService) {

    fun update(node: EconomyNode) {
        updateChildren(node)
        updateNodeStorage(node)
        updateEntities(node)
    }

    private fun updateChildren(node: EconomyNode) {
        node.children.forEach { update(it) }
    }

    private fun updateNodeStorage(node: EconomyNode) {
        node.storage.revertToInitial()
        node.children.forEach { node.storage.merge(it.storage) }
    }

    private fun updateEntities(node: EconomyNode) {
        node.collectEntities()
            .filter { it.config.isActive }
            .filter { it.state.state == EconomyUpdateState.CONSUME }
            .sortedBy { it.config.priority }
            .forEach { consumptionEntityUpdateService.update(it, node) }
    }

}