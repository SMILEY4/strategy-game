package de.ruegnerlukas.strategygame.backend.core.economyV3

import de.ruegnerlukas.strategygame.backend.core.economyV3.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.core.economyV3.data.EconomyNode.Companion.collectEntities
import de.ruegnerlukas.strategygame.backend.core.economyV3.data.EconomyNode.Companion.collectNodes
import de.ruegnerlukas.strategygame.backend.core.economyV3.elements.nodes.ProvinceEconomyNode
import de.ruegnerlukas.strategygame.backend.core.economyV3.elements.nodes.WorldEconomyNode
import de.ruegnerlukas.strategygame.backend.core.economyV3.service.ConsumptionEntityUpdateService
import de.ruegnerlukas.strategygame.backend.core.economyV3.service.ConsumptionNodeUpdateService
import de.ruegnerlukas.strategygame.backend.core.economyV3.service.ProductionEntityUpdateService
import de.ruegnerlukas.strategygame.backend.core.economyV3.service.ProductionNodeUpdateService
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
        node.province.resourcesConsumedCurrTurn = node.getStorage().getRemoved()
        node.province.resourcesMissing = ResourceStats().also { missing ->
            node.collectEntities().forEach { entity ->
                entity.getRequires().forEach { missing.add(it) }
            }
        }
    }


}