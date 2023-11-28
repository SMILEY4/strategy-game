package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.events.BasicEventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode.Companion.collectNodes
import de.ruegnerlukas.strategygame.backend.economy.ledger.NodeLedger
import de.ruegnerlukas.strategygame.backend.economy.logic.EconomyService
import de.ruegnerlukas.strategygame.backend.economy.report.ConsumptionReportEntry
import de.ruegnerlukas.strategygame.backend.economy.report.EconomyUpdateReport
import de.ruegnerlukas.strategygame.backend.economy.report.MissingResourcesReportEntry
import de.ruegnerlukas.strategygame.backend.economy.report.ProductionReportEntry
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.EconomyPopFoodConsumptionProvider
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.BuildingEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.PopulationBaseEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.PopulationGrowthEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.ProductionQueueEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.BuildingConsumptionDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.BuildingMissingDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.BuildingProductionDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.GiveSharedResourceDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.LedgerResourceDetailBuilderImpl
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.PopulationBaseDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.PopulationBaseMissingDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.PopulationGrowthDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.PopulationGrowthMissingDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.ProductionQueueDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.ProductionQueueMissingDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.TakeSharedResourceDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.UnknownConsumptionLedgerDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.UnknownMissingLedgerDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.UnknownProductionLedgerDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.node.MarketEconomyNode
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
                printFlowSummary(rootNode, report)
                writeBack(game, report)
                eventResultOk(game)
            }
        }
    }

    private fun buildEconomyTree(game: GameExtended): EconomyNode {
        return WorldEconomyNode(game, config, popFoodConsumption)
    }

    private fun writeBack(game: GameExtended, report: EconomyUpdateReport) {

        // reset
        game.provinces.forEach { province ->
            province.resourcesConsumedCurrTurn = ResourceCollection.basic()
            province.resourcesProducedCurrTurn = ResourceCollection.basic()
            province.resourcesMissing = ResourceCollection.basic()
        }
        game.cities.forEach { city ->
            city.population.popConsumedFood = 0f
            city.population.popGrowthConsumedFood = false
            city.infrastructure.buildings.forEach { building ->
                building.active = false
            }
        }

        // apply report entries
        report.getEntries().forEach { entry ->
            when (entry) {

                is ConsumptionReportEntry -> {
                    if (entry.entity.owner is ProvinceEconomyNode) {
                        val province = (entry.entity.owner as ProvinceEconomyNode).province
                        province.resourcesConsumedCurrTurn.add(entry.resources)
                    }
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
                    if (entry.entity.owner is ProvinceEconomyNode) {
                        val province = (entry.entity.owner as ProvinceEconomyNode).province
                        province.resourcesProducedCurrTurn.add(entry.resources)
                    }
                    if (entry.entity is PopulationGrowthEconomyEntity) {
                        entry.entity.city.population.popGrowthConsumedFood = true
                    }
                }

                is MissingResourcesReportEntry -> {
                    if (entry.entity.owner is ProvinceEconomyNode) {
                        val province = (entry.entity.owner as ProvinceEconomyNode).province
                        province.resourcesMissing.add(entry.resources)
                    }
                }

            }
        }
    }


    private fun printFlowSummary(rootNode: EconomyNode, report: EconomyUpdateReport) {

        println()
        println()
        println()
        println("========================")

        rootNode.collectNodes().forEach { node ->
            when(node) {
                is WorldEconomyNode -> {
                    println("[WORLD]:")
                }
                is MarketEconomyNode -> {
                    println("[MARKET]")
                }
                is ProvinceEconomyNode -> {
                    println("[PROVINCE] ${node.province.provinceCapitalCityId}:")
                }
            }

            val ledger = NodeLedger(LedgerResourceDetailBuilderImpl()).also { it.record(report, node) }

            ledger.getEntries().forEach { entry ->
                println("   * ${entry.amount} ${entry.resourceType} (${entry.missing} missing)")
                entry.details.forEach { detail ->
                    when(detail) {
                        is UnknownConsumptionLedgerDetail -> println("      * -${detail.amount}: consumed by unknown")
                        is UnknownProductionLedgerDetail -> println("      * +${detail.amount}: produced by unknown")
                        is UnknownMissingLedgerDetail -> println("      * ${detail.amount}: missed by unknown")
                        is PopulationBaseDetail -> println("      * -${detail.amount}: consumed by population basics")
                        is PopulationBaseMissingDetail -> println("      * ${detail.amount}: missed by population basics")
                        is PopulationGrowthDetail -> println("      * -${detail.amount}: consumed by population growth")
                        is PopulationGrowthMissingDetail -> println("      * ${detail.amount}: missed by population growth")
                        is BuildingConsumptionDetail -> println("      * -${detail.amount}: consumed by ${detail.buildingType}")
                        is BuildingProductionDetail -> println("      * +${detail.amount}:  produced by ${detail.buildingType}")
                        is BuildingMissingDetail -> println("      * ${detail.amount}:  missed by ${detail.buildingType}")
                        is ProductionQueueDetail -> println("      * -${detail.amount}: consumed by production queue")
                        is ProductionQueueMissingDetail -> println("      * ${detail.amount}: missed by production queue")
                        is GiveSharedResourceDetail -> println("      * -${detail.amount}: sold on marked")
                        is TakeSharedResourceDetail -> println("      * +${detail.amount}: bought on market")
                    }
                }
            }

        }

        println("========================")
        println()
        println()
        println()
    }

}