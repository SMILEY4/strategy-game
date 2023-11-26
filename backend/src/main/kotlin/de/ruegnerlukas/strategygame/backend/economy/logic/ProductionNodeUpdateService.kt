package de.ruegnerlukas.strategygame.backend.economy.logic

import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyUpdateState

class ProductionNodeUpdateService(private val productionEntityUpdateService: ProductionEntityUpdateService) {

    fun update(node: EconomyNode) {
        updateChildren(node)
        updateEntities(node)
    }

    private fun updateChildren(node: EconomyNode) {
        node.children.forEach { update(it) }
    }

    private fun updateEntities(node: EconomyNode) {
        node.entities
            .filter { it.config.isActive }
            .filter { it.state.state == EconomyUpdateState.PRODUCE }
            .sortedBy { it.config.priority }
            .forEach { productionEntityUpdateService.update(it) }
    }

}