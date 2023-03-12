package de.ruegnerlukas.strategygame.backend.core.economyV3.service

import de.ruegnerlukas.strategygame.backend.core.economyV3.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.core.economyV3.data.EconomyNode.Companion.collectEntities

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
            .filter { it.isReadyToConsume() }
            .sortedBy { it.getPriority() }
            .forEach { consumptionEntityUpdateService.update(it, node) }
    }

}