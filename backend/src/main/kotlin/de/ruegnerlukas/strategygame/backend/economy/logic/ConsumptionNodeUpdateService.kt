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
        node.getChildren().forEach { update(it) }
    }

    private fun updateNodeStorage(node: EconomyNode) {
        node.getStorage().revertToInitial()
        node.getChildren().forEach { node.getStorage().merge(it.getStorage()) }
    }

    private fun updateEntities(node: EconomyNode) {
        node.collectEntities()
            .filter { it.getConfig().isActive }
            .filter { it.getState().state == EconomyUpdateState.CONSUME }
            .sortedBy { it.getConfig().priority }
            .forEach { consumptionEntityUpdateService.update(it, node) }
    }

}