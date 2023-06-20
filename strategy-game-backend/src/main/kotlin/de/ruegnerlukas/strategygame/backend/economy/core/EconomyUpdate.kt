package de.ruegnerlukas.strategygame.backend.economy.core

import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.models.ResourceCollection
import de.ruegnerlukas.strategygame.backend.economy.core.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.economy.core.data.EconomyNode.Companion.collectEntities
import de.ruegnerlukas.strategygame.backend.economy.core.data.EconomyNode.Companion.collectNodes
import de.ruegnerlukas.strategygame.backend.economy.core.service.ConsumptionEntityUpdateService
import de.ruegnerlukas.strategygame.backend.economy.core.service.ConsumptionNodeUpdateService
import de.ruegnerlukas.strategygame.backend.economy.core.service.ProductionEntityUpdateService
import de.ruegnerlukas.strategygame.backend.economy.core.service.ProductionNodeUpdateService
import de.ruegnerlukas.strategygame.backend.economy.ports.provided.EconomyUpdate
import de.ruegnerlukas.strategygame.backend.economy.ports.required.EconomyPopFoodConsumptionProvider
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.BuildingEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.PopulationBaseEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.PopulationGrowthEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ProductionQueueEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ProvinceEconomyNode
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.WorldEconomyNode

// TODO: try to extract dependencies on game engine
class EconomyUpdateImpl(private val config: GameConfig, private val popFoodConsumption: EconomyPopFoodConsumptionProvider) : EconomyUpdate {

    private val consumptionNodeUpdateService = ConsumptionNodeUpdateService(ConsumptionEntityUpdateService())
    private val productionNodeUpdateService = ProductionNodeUpdateService(ProductionEntityUpdateService())

    override fun update(game: GameExtended) {
        val rootNode = buildEconomyTree(game)
        consumptionNodeUpdateService.update(rootNode)
        productionNodeUpdateService.update(rootNode)
        writeBack(rootNode)
    }

    private fun buildEconomyTree(game: GameExtended): EconomyNode {
        return WorldEconomyNode(game, config, popFoodConsumption)
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
            .forEach { entity -> entity.city.popGrowthConsumedFood = entity.hasConsumedFood() }
    }

}