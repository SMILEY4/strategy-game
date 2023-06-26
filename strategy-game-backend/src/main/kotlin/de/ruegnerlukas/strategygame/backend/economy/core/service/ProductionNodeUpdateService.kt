package de.ruegnerlukas.strategygame.backend.economy.core.service

import de.ruegnerlukas.strategygame.backend.economy.core.data.EconomyNode

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
            .filter { !it.isInactive() }
            .filter { it.isReadyToProduce() }
            .sortedBy { it.getPriority() }
            .forEach { productionEntityUpdateService.update(it) }
    }

}