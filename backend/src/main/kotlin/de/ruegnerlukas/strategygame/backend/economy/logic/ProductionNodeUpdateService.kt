package de.ruegnerlukas.strategygame.backend.economy.logic

import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyUpdateState

class ProductionNodeUpdateService(private val productionEntityUpdateService: ProductionEntityUpdateService) {

    fun update(node: EconomyNode) {
        updateChildren(node)
        updateEntities(node)
    }

    private fun updateChildren(node: EconomyNode) {
        node.getChildren().forEach { update(it) }
    }

    private fun updateEntities(node: EconomyNode) {
        node.getEntities()
            .filter { it.getConfig().isActive }
            .filter { it.getState().state == EconomyUpdateState.PRODUCE }
            .sortedBy { it.getConfig().priority }
            .forEach { productionEntityUpdateService.update(it) }
    }

}