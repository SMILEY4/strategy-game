package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.detaillog.BooleanDetailLogValue
import de.ruegnerlukas.strategygame.backend.common.detaillog.ResourcesDetailLogValue
import de.ruegnerlukas.strategygame.backend.common.events.BasicEventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType
import de.ruegnerlukas.strategygame.backend.common.utils.buildMutableMap
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode.Companion.collectNodes
import de.ruegnerlukas.strategygame.backend.economy.logic.EconomyService
import de.ruegnerlukas.strategygame.backend.economy.report.ConsumptionReportEntry
import de.ruegnerlukas.strategygame.backend.economy.report.EconomyReport
import de.ruegnerlukas.strategygame.backend.economy.report.MissingResourcesReportEntry
import de.ruegnerlukas.strategygame.backend.economy.report.ProductionReportEntry
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.EconomyPopFoodConsumptionProvider
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.BuildingEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.GameEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.PopulationBaseEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.PopulationGrowthEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.ProductionQueueEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.ResourceLedger
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.node.ProvinceEconomyNode
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.node.WorldEconomyNode
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.BuildingDetailType
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.entities.GameEntity

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
                building.details.replaceDetail(BuildingDetailType.ACTIVITY, buildMutableMap {
                    this["active"] = BooleanDetailLogValue(false)
                })
                building.details.clear(setOf(BuildingDetailType.CONSUMED, BuildingDetailType.PRODUCED, BuildingDetailType.MISSING))
            }
        }

        // save ledger
        rootNode.collectNodes().forEach { node ->
            if (node is ProvinceEconomyNode) {
                val ledger = ResourceLedger().also { it.record(report, node) }
                node.province.resourceLedger = ledger
            }
        }

        // apply report entries
        report.getEntries().forEach { entry ->
            if (entry.entity is GameEconomyEntity) {
                when (val gameEntity = entry.entity as GameEconomyEntity) {

                    is BuildingEconomyEntity -> {
                        when(entry) {
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
                        when(entry) {
                            is ConsumptionReportEntry -> {
                                gameEntity.city.population.popConsumedFood += entry.resources[ResourceType.FOOD]
                            }
                            else -> Unit
                        }
                    }

                    is PopulationGrowthEconomyEntity -> {
                        when(entry) {
                            is ConsumptionReportEntry -> {
                                gameEntity.city.population.popConsumedFood += entry.resources[ResourceType.FOOD]
                            }
                            else -> Unit
                        }
                    }

                    is ProductionQueueEconomyEntity -> {
                        when(entry) {
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