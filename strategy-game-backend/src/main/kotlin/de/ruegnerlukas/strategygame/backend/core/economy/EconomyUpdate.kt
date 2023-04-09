package de.ruegnerlukas.strategygame.backend.core.economy

import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyNode.Companion.collectEntities
import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyNode.Companion.collectNodes
import de.ruegnerlukas.strategygame.backend.core.economy.elements.entities.BuildingEconomyEntity
import de.ruegnerlukas.strategygame.backend.core.economy.elements.entities.PopulationBaseEconomyEntity
import de.ruegnerlukas.strategygame.backend.core.economy.elements.entities.PopulationGrowthEconomyEntity
import de.ruegnerlukas.strategygame.backend.core.economy.elements.entities.ProductionQueueEconomyEntity
import de.ruegnerlukas.strategygame.backend.core.economy.elements.nodes.ProvinceEconomyNode
import de.ruegnerlukas.strategygame.backend.core.economy.elements.nodes.WorldEconomyNode
import de.ruegnerlukas.strategygame.backend.core.economy.service.ConsumptionEntityUpdateService
import de.ruegnerlukas.strategygame.backend.core.economy.service.ConsumptionNodeUpdateService
import de.ruegnerlukas.strategygame.backend.core.economy.service.ProductionEntityUpdateService
import de.ruegnerlukas.strategygame.backend.core.economy.service.ProductionNodeUpdateService
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceCollection

class EconomyUpdate(private val config: GameConfig) {

    private val consumptionNodeUpdateService = ConsumptionNodeUpdateService(ConsumptionEntityUpdateService())
    private val productionNodeUpdateService = ProductionNodeUpdateService(ProductionEntityUpdateService())

    fun update(game: GameExtended) {
        val rootNode = buildEconomyTree(game)
        consumptionNodeUpdateService.update(rootNode)
        productionNodeUpdateService.update(rootNode)
        writeBack(rootNode)
    }

    private fun buildEconomyTree(game: GameExtended): EconomyNode {
        return WorldEconomyNode(game, config)
    }

    private fun writeBack(rootNode: EconomyNode) {
        rootNode.collectNodes()
            .filterIsInstance<ProvinceEconomyNode>()
            .forEach { writeBack(it) }
    }

    private fun writeBack(node: ProvinceEconomyNode) {
        node.province.resourcesProducedCurrTurn = node.getStorage().getAdded()
        node.province.resourcesConsumedCurrTurn = ResourceCollection.basic().also {
            it.add(node.getStorage().getRemoved())
            it.add(node.getStorage().getRemovedFromShared())
        }
        node.province.resourcesMissing = ResourceCollection.basic().also { missing ->
            node.collectEntities()
                .filter { !it.isInactive() }
                .forEach { entity -> missing.add(entity.getRequires()) }
        }
        node.getEntities()
            .filterIsInstance<BuildingEconomyEntity>()
            .forEach { entity -> entity.building.active = entity.hasProduced() }
        node.getEntities()
            .filterIsInstance<ProductionQueueEconomyEntity>()
            .forEach { entity -> entity.queueEntry.collectedResources.add(entity.getProvidedResources()) }
        node.getEntities()
            .filterIsInstance<PopulationBaseEconomyEntity>()
            .forEach { entity -> entity.city.popConsumedFood = entity.getConsumedFood() }
        node.getEntities()
            .filterIsInstance<PopulationGrowthEconomyEntity>()
            .forEach{ entity -> entity.city.popGrowthConsumedFood = entity.hasConsumedFood() }
    }

}