package io.github.smiley4.strategygame.backend.engine.module.gamestep

import io.github.smiley4.strategygame.backend.common.events.BasicEventNodeDefinition
import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.buildMutableMap
import io.github.smiley4.strategygame.backend.commondata.BooleanDetailLogValue
import io.github.smiley4.strategygame.backend.commondata.BuildingDetailType
import io.github.smiley4.strategygame.backend.commondata.GameConfig
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.ResourceLedgerImpl
import io.github.smiley4.strategygame.backend.commondata.ResourceType
import io.github.smiley4.strategygame.backend.commondata.ResourcesDetailLogValue
import io.github.smiley4.strategygame.backend.ecosim.edge.ConsumptionReportEntry
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNode.Companion.collectNodes
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyReport
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyService
import io.github.smiley4.strategygame.backend.ecosim.edge.MissingResourcesReportEntry
import io.github.smiley4.strategygame.backend.ecosim.edge.ProductionReportEntry
import io.github.smiley4.strategygame.backend.ecosim.edge.record
import io.github.smiley4.strategygame.backend.engine.module.eco.EconomyPopFoodConsumptionProvider
import io.github.smiley4.strategygame.backend.engine.module.eco.ResourceLedgerDetailBuilderImpl
import io.github.smiley4.strategygame.backend.engine.module.eco.entity.BuildingEconomyEntity
import io.github.smiley4.strategygame.backend.engine.module.eco.entity.GameEconomyEntity
import io.github.smiley4.strategygame.backend.engine.module.eco.entity.PopulationBaseEconomyEntity
import io.github.smiley4.strategygame.backend.engine.module.eco.entity.PopulationGrowthEconomyEntity
import io.github.smiley4.strategygame.backend.engine.module.eco.entity.ProductionQueueEconomyEntity
import io.github.smiley4.strategygame.backend.engine.module.eco.node.ProvinceEconomyNode
import io.github.smiley4.strategygame.backend.engine.module.eco.node.WorldEconomyNode


/**
 * Handles turn-income and turn-expenses
 */
class GENUpdateEconomy(
    private val config: GameConfig,
    private val popFoodConsumption: EconomyPopFoodConsumptionProvider,
    private val economyService: EconomyService,
    eventSystem: EventSystem
) : Logging {

    object Definition : BasicEventNodeDefinition<GameExtended, GameExtended>()

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

    private val resourceLedgerDetailBuilder = ResourceLedgerDetailBuilderImpl()

    private fun buildEconomyTree(game: GameExtended): EconomyNode {
        return WorldEconomyNode(game, config, popFoodConsumption)
    }

    private fun writeBack(game: GameExtended, report: EconomyReport, rootNode: EconomyNode) {

        // reset
        game.cities.forEach { city ->
            city.population.consumedFood = 0f
            city.population.growthConsumedFood = false
            city.infrastructure.buildings.forEach { building ->
                building.active = false
                building.details.replaceDetail(BuildingDetailType.ACTIVITY, buildMutableMap {
                    this["active"] = BooleanDetailLogValue(false)
                })
                building.details.clear(setOf(BuildingDetailType.CONSUMED, BuildingDetailType.PRODUCED, BuildingDetailType.MISSING))
            }
        }

        // save ledger
        rootNode.collectNodes().forEach { node ->
            if (node is ProvinceEconomyNode) {
                val ledger = ResourceLedgerImpl().also { it.record(report, node, resourceLedgerDetailBuilder) }
                node.province.resourceLedger = ledger
            }
        }

        // apply report entries
        report.getEntries().forEach { entry ->
            if (entry.entity is GameEconomyEntity) {
                when (val gameEntity = entry.entity as GameEconomyEntity) {

                    is BuildingEconomyEntity -> {
                        when (entry) {
                            is ConsumptionReportEntry -> {
                                gameEntity.building.active = true
                                gameEntity.building.details.replaceDetail(BuildingDetailType.ACTIVITY, buildMutableMap {
                                    this["active"] = BooleanDetailLogValue(true)
                                })
                                gameEntity.building.details.mergeDetail(BuildingDetailType.CONSUMED, buildMutableMap {
                                    this["resources"] = ResourcesDetailLogValue(entry.resources)
                                })
                            }
                            is ProductionReportEntry -> {
                                gameEntity.building.active = true
                                gameEntity.building.details.replaceDetail(BuildingDetailType.ACTIVITY, buildMutableMap {
                                    this["active"] = BooleanDetailLogValue(true)
                                })
                                gameEntity.building.details.mergeDetail(BuildingDetailType.PRODUCED, buildMutableMap {
                                    this["resources"] = ResourcesDetailLogValue(entry.resources)
                                })
                            }
                            is MissingResourcesReportEntry -> {
                                gameEntity.building.details.mergeDetail(BuildingDetailType.MISSING, buildMutableMap {
                                    this["resources"] = ResourcesDetailLogValue(entry.resources)
                                })
                            }
                        }
                    }

                    is PopulationBaseEconomyEntity -> {
                        when (entry) {
                            is ConsumptionReportEntry -> {
                                gameEntity.city.population.consumedFood += entry.resources[ResourceType.FOOD]
                            }
                            else -> Unit
                        }
                    }

                    is PopulationGrowthEconomyEntity -> {
                        when (entry) {
                            is ConsumptionReportEntry -> {
                                gameEntity.city.population.consumedFood += entry.resources[ResourceType.FOOD]
                            }
                            else -> Unit
                        }
                    }

                    is ProductionQueueEconomyEntity -> {
                        when (entry) {
                            is ConsumptionReportEntry -> {
                                gameEntity.queueEntry.collectedResources.add(entry.resources)
                            }
                            else -> Unit
                        }
                    }
                }
            }
        }

    }

}