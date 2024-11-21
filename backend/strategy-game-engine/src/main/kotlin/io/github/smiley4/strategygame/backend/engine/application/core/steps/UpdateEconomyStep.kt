package io.github.smiley4.strategygame.backend.engine.application.core.steps

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.ResourceLedger
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyNode.Companion.collectEntities
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyNode.Companion.collectNodes
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyReport
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyService
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyUpdateState
import io.github.smiley4.strategygame.backend.engine.application.core.common.GameEventNode
import io.github.smiley4.strategygame.backend.engine.application.core.common.GameEventPublisher
import io.github.smiley4.strategygame.backend.engine.application.core.common.send
import io.github.smiley4.strategygame.backend.engine.application.core.economy.entity.GameEconomyEntity
import io.github.smiley4.strategygame.backend.engine.application.core.economy.entity.PopulationBaseEconomyEntity
import io.github.smiley4.strategygame.backend.engine.application.core.economy.entity.PopulationGrowthEconomyEntity
import io.github.smiley4.strategygame.backend.engine.application.core.economy.entity.ProductionQueueEconomyEntity
import io.github.smiley4.strategygame.backend.engine.application.core.economy.node.CountryEconomyNode
import io.github.smiley4.strategygame.backend.engine.application.core.economy.node.GameEconomyNode
import io.github.smiley4.strategygame.backend.engine.application.core.economy.node.ProvinceEconomyNode
import io.github.smiley4.strategygame.backend.engine.application.core.economy.node.SettlementEconomyNode
import io.github.smiley4.strategygame.backend.engine.application.core.economy.node.WorldEconomyNode
import io.github.smiley4.strategygame.backend.engine.application.core.economy.record
import io.github.smiley4.strategygame.backend.engine.application.core.events.UpdateWorldEvent
import io.github.smiley4.strategygame.backend.engine.application.core.events.UpdatedEconomyEvent

internal class UpdateEconomyStep(private val economyService: EconomyService) : GameEventNode<UpdateWorldEvent>, Logging {

    override fun handle(event: UpdateWorldEvent, publisher: GameEventPublisher) {
        log().info("Updating economy.")
        val node = setup(event.game)
        val report = simulate(node)
        writeBack(node, report)
        publisher.send(UpdatedEconomyEvent(event.game, report))
    }


    private fun setup(game: GameExtended): EconomyNode {
        return WorldEconomyNode(game)
    }


    private fun simulate(node: EconomyNode): EconomyReport {
        return economyService.update(node)
    }


    private fun writeBack(root: EconomyNode, report: EconomyReport) {
        root.collectNodes().filterIsInstance<GameEconomyNode>().forEach { node ->
            when (node) {
                is SettlementEconomyNode -> {
                    node.settlement.resourceLedger = ResourceLedger.build {
                        record(report, node)
                    }
                }
                is WorldEconomyNode -> Unit
                is CountryEconomyNode -> Unit
                is ProvinceEconomyNode -> Unit
            }
        }
        root.collectEntities().filterIsInstance<GameEconomyEntity>().forEach { entity ->
            when (entity) {
                is io.github.smiley4.strategygame.backend.engine.application.core.economy.entity.BuildingEconomyEntity -> {
                    entity.building.also { building ->
                        building.validity.inputResources = entity.state.state == EconomyUpdateState.DONE
                        building.activity.consumed.also {
                            it.clear()
                            it.add(entity.state.getConsumedResources())
                        }
                        building.activity.produced.also {
                            it.clear()
                            it.add(entity.state.getProducedResources())
                        }
                        building.activity.missing.also {
                            it.clear()
                            it.add(entity.state.getRemainingRequired())
                        }
                    }
                }
                is PopulationBaseEconomyEntity -> Unit
                is PopulationGrowthEconomyEntity -> Unit
                is ProductionQueueEconomyEntity -> Unit
            }
        }
    }

}