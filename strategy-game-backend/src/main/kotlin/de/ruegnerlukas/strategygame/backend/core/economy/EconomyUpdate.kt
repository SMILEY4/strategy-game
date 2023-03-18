package de.ruegnerlukas.strategygame.backend.core.economy

import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyNode.Companion.collectEntities
import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyNode.Companion.collectNodes
import de.ruegnerlukas.strategygame.backend.core.economy.elements.nodes.ProvinceEconomyNode
import de.ruegnerlukas.strategygame.backend.core.economy.elements.nodes.WorldEconomyNode
import de.ruegnerlukas.strategygame.backend.core.economy.service.ConsumptionEntityUpdateService
import de.ruegnerlukas.strategygame.backend.core.economy.service.ConsumptionNodeUpdateService
import de.ruegnerlukas.strategygame.backend.core.economy.service.ProductionEntityUpdateService
import de.ruegnerlukas.strategygame.backend.core.economy.service.ProductionNodeUpdateService
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStats

class EconomyUpdate {

    private val consumptionNodeUpdateService = ConsumptionNodeUpdateService(ConsumptionEntityUpdateService())
    private val productionNodeUpdateService = ProductionNodeUpdateService(ProductionEntityUpdateService())

    fun update(game: GameExtended) {
        val rootNode = buildEconomyTree(game)
        consumptionNodeUpdateService.update(rootNode)
        productionNodeUpdateService.update(rootNode)
        writeBack(rootNode)
    }

    private fun buildEconomyTree(game: GameExtended): EconomyNode {
        return WorldEconomyNode(game)
    }

    private fun writeBack(rootNode: EconomyNode) {
        rootNode.collectNodes()
            .filterIsInstance<ProvinceEconomyNode>()
            .forEach { writeBack(it) }
    }

    private fun writeBack(node: ProvinceEconomyNode) {
        node.province.resourcesProducedCurrTurn = node.getStorage().getAdded()
        node.province.resourcesConsumedCurrTurn = ResourceStats().also {
            it.add(node.getStorage().getRemoved())
            it.add(node.getStorage().getRemovedFromShared())
        }
        node.province.resourcesMissing = ResourceStats().also { missing ->
            node.collectEntities().forEach { entity ->
                entity.getRequires().forEach { missing.add(it) }
            }
        }
    }

}