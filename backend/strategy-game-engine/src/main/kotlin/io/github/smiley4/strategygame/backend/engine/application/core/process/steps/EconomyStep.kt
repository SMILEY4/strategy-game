package io.github.smiley4.strategygame.backend.engine.application.core.process.steps

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.ResourceLedger
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyNode.Companion.collectEntities
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyNode.Companion.collectNodes
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyReport
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyService
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyUpdateState
import io.github.smiley4.strategygame.backend.engine.application.core.economy.entity.GameEconomyEntity
import io.github.smiley4.strategygame.backend.engine.application.core.economy.entity.PopulationBaseEconomyEntity
import io.github.smiley4.strategygame.backend.engine.application.core.economy.entity.PopulationGrowthEconomyEntity
import io.github.smiley4.strategygame.backend.engine.application.core.economy.entity.ProductionQueueEconomyEntity
import io.github.smiley4.strategygame.backend.engine.application.core.economy.node.GameEconomyNode
import io.github.smiley4.strategygame.backend.engine.application.core.economy.node.NetworkEconomyNode
import io.github.smiley4.strategygame.backend.engine.application.core.economy.node.SettlementEconomyNode
import io.github.smiley4.strategygame.backend.engine.application.core.economy.node.WorldEconomyNode
import io.github.smiley4.strategygame.backend.engine.application.core.economy.record
import io.github.smiley4.strategygame.backend.engine.application.core.process.events.EconomyUpdatedEvent
import io.github.smiley4.strategygame.backend.engine.application.core.process.events.OnUpdateWorldEvent
import io.github.smiley4.strategygame.backend.engine.application.core.process.system.ProcessEventPublisher
import io.github.smiley4.strategygame.backend.engine.application.core.process.system.ProcessStep
import io.github.smiley4.strategygame.backend.engine.application.core.tools.SettlementNetworkBuilder

internal class EconomyStep(
    private val economyService: EconomyService,
    private val publisher: ProcessEventPublisher
) : ProcessStep<OnUpdateWorldEvent>, Logging {

    override suspend fun run(event: OnUpdateWorldEvent) {
        val node = setup(event.game)
        val report = simulate(node)
        writeBack(node, report)
        publisher.publish(EconomyUpdatedEvent(event.game, report))
    }


    private fun setup(game: GameExtended): EconomyNode {
        return WorldEconomyNode(game, SettlementNetworkBuilder().build(game.settlements.map { it.id }, game.routes))
    }


    private fun simulate(node: EconomyNode): EconomyReport {
        return economyService.update(node)
    }


    private fun writeBack(root: EconomyNode, report: EconomyReport) {
        root.collectNodes().filterIsInstance<GameEconomyNode>().forEach { node ->
            when (node) {
                is WorldEconomyNode -> Unit
                is NetworkEconomyNode -> Unit
                is SettlementEconomyNode -> {
                    node.settlement.resourceLedger = ResourceLedger.build {
                        record(report, node)
                    }
                }
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