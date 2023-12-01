package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.events.BasicEventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode.Companion.collectNodes
import de.ruegnerlukas.strategygame.backend.economy.logic.EconomyService
import de.ruegnerlukas.strategygame.backend.economy.report.ConsumptionReportEntry
import de.ruegnerlukas.strategygame.backend.economy.report.EconomyReport
import de.ruegnerlukas.strategygame.backend.economy.report.MissingResourcesReportEntry
import de.ruegnerlukas.strategygame.backend.economy.report.ProductionReportEntry
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.EconomyPopFoodConsumptionProvider
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.BuildingEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.PopulationBaseEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.PopulationGrowthEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.ProductionQueueEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.ResourceLedger
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.ResourceLedgerDetailBuilderImpl
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.node.ProvinceEconomyNode
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.node.WorldEconomyNode
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended

/**
 * Handles turn-income and turn-expenses
 */
class GENUpdateEconomy(
    private val config: GameConfig,
    private val popFoodConsumption: EconomyPopFoodConsumptionProvider,
    eventSystem: EventSystem
) : Logging {

    object Definition : BasicEventNodeDefinition<GameExtended, GameExtended>()

    private val economyService = EconomyService()

    init {
        eventSystem.createNode(Definition) {
            trigger(TriggerGlobalUpdate)
            action { game ->
                log().debug("Update economy")
                val rootNode = buildEconomyTree(game)
                val report = economyService.update(rootNode)
                writeBack(game, report, rootNode)
                eventResultOk(game)
            }
        }
    }

    private fun buildEconomyTree(game: GameExtended): EconomyNode {
        return WorldEconomyNode(game, config, popFoodConsumption)
    }

    private fun writeBack(game: GameExtended, report: EconomyReport, rootNode: EconomyNode) {

        // reset
        game.cities.forEach { city ->
            city.population.popConsumedFood = 0f
            city.population.popGrowthConsumedFood = false
            city.infrastructure.buildings.forEach { building ->
                building.active = false
            }
        }

        // save ledger
        rootNode.collectNodes().forEach { node ->
            if (node is ProvinceEconomyNode) {
                val ledger = ResourceLedger(ResourceLedgerDetailBuilderImpl()).also { it.record(report, node) }
                node.province.resourceLedger = ledger
            }
        }

        // apply report entries
        report.getEntries().forEach { entry ->
            when (entry) {
                is ConsumptionReportEntry -> {
                    if (entry.entity is BuildingEconomyEntity) {
                        entry.entity.building.active = true
                    }
                    if (entry.entity is ProductionQueueEconomyEntity) {
                        entry.entity.queueEntry.collectedResources.add(entry.resources)
                    }
                    if (entry.entity is PopulationBaseEconomyEntity) {
                        entry.entity.city.population.popConsumedFood += entry.resources[ResourceType.FOOD]
                    }
                }
                is ProductionReportEntry -> {
                    if (entry.entity is PopulationGrowthEconomyEntity) {
                        entry.entity.city.population.popGrowthConsumedFood = true
                    }
                }
                is MissingResourcesReportEntry -> Unit
            }
        }
    }

}