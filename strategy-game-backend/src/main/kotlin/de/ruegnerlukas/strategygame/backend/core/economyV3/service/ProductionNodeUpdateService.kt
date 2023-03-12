package de.ruegnerlukas.strategygame.backend.core.economyV3.service

import de.ruegnerlukas.strategygame.backend.core.economyV3.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.core.economyV3.data.EconomyNode.Companion.collectEntities

class ProductionNodeUpdateService(private val productionEntityUpdateService: ProductionEntityUpdateService) {

    fun update(node: EconomyNode) {
        updateChildren(node)
        updateEntities(node)
    }

    private fun updateChildren(node: EconomyNode) {
        node.getChildren().forEach { update(it) }
    }

    private fun updateEntities(node: EconomyNode) {
        node.collectEntities()
            .filter { it.isReadyToProduce() }
            .sortedBy { it.getPriority() }
            .forEach { productionEntityUpdateService.update(it) }
    }

}