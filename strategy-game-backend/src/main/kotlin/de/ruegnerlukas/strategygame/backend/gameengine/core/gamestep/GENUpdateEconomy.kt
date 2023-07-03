package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.events.BasicEventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.economy.core.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.economy.core.data.EconomyNode.Companion.collectEntities
import de.ruegnerlukas.strategygame.backend.economy.core.data.EconomyNode.Companion.collectNodes
import de.ruegnerlukas.strategygame.backend.economy.core.service.ConsumptionEntityUpdateService
import de.ruegnerlukas.strategygame.backend.economy.core.service.ConsumptionNodeUpdateService
import de.ruegnerlukas.strategygame.backend.economy.core.service.ProductionEntityUpdateService
import de.ruegnerlukas.strategygame.backend.economy.core.service.ProductionNodeUpdateService
import de.ruegnerlukas.strategygame.backend.economy.ports.required.EconomyPopFoodConsumptionProvider
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.BuildingEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.PopulationBaseEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.PopulationGrowthEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.ProductionQueueEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.node.ProvinceEconomyNode
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.node.WorldEconomyNode

/**
 * Handles turn-income and turn-expenses
 */
class GENUpdateEconomy(
    private val config: GameConfig,
    private val popFoodConsumption: EconomyPopFoodConsumptionProvider,
    eventSystem: EventSystem
) : Logging {

    object Definition : BasicEventNodeDefinition<GameExtended, GameExtended>()

    private val consumptionNodeUpdateService = ConsumptionNodeUpdateService(ConsumptionEntityUpdateService())
    private val productionNodeUpdateService = ProductionNodeUpdateService(ProductionEntityUpdateService())


    init {
        eventSystem.createNode(Definition) {
            trigger(TriggerGlobalUpdate)
            action { game ->
                log().debug("Update economy")
                val rootNode = buildEconomyTree(game)
                consumptionNodeUpdateService.update(rootNode)
                productionNodeUpdateService.update(rootNode)
                writeBack(rootNode)
                eventResultOk(game)
            }
        }
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
                .filter { it.isActive() }
                .forEach { entity -> missing.add(entity.getRequiredInput()) }
        }
        node.getEntities()
            .filterIsInstance<BuildingEconomyEntity>()
            .forEach { entity -> entity.building.active = entity.completedOutput() }
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