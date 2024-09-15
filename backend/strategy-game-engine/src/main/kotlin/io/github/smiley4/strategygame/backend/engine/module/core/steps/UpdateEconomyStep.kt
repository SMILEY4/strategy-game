package io.github.smiley4.strategygame.backend.engine.module.core.steps

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.ResourceLedger
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNode.Companion.collectNodes
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyReport
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyService
import io.github.smiley4.strategygame.backend.ecosim.edge.record
import io.github.smiley4.strategygame.backend.ecosim.module.ledger.ResourceLedgerDetailBuilder
import io.github.smiley4.strategygame.backend.engine.module.core.common.GameEventNode
import io.github.smiley4.strategygame.backend.engine.module.core.common.GameEventPublisher
import io.github.smiley4.strategygame.backend.engine.module.core.economy.node.CountryEconomyNode
import io.github.smiley4.strategygame.backend.engine.module.core.economy.node.GameEconomyNode
import io.github.smiley4.strategygame.backend.engine.module.core.economy.node.ProvinceEconomyNode
import io.github.smiley4.strategygame.backend.engine.module.core.economy.node.SettlementEconomyNode
import io.github.smiley4.strategygame.backend.engine.module.core.economy.node.WorldEconomyNode
import io.github.smiley4.strategygame.backend.engine.module.core.events.UpdateWorldEvent

internal class UpdateEconomyStep(
    private val economyService: EconomyService,
    private val resourceLedgerDetailBuilder: ResourceLedgerDetailBuilder
) : GameEventNode<UpdateWorldEvent>, Logging {

    override fun handle(event: UpdateWorldEvent, publisher: GameEventPublisher) {
        log().info("Updating economy.")
        val node = setup(event.game)
        val report = simulate(node)
        updateLedgers(node, report)
    }


    private fun setup(game: GameExtended): EconomyNode {
        return WorldEconomyNode(game)
    }


    private fun simulate(node: EconomyNode): EconomyReport {
        return economyService.update(node)
    }


    private fun updateLedgers(root: EconomyNode, report: EconomyReport) {
        root.collectNodes().filterIsInstance<GameEconomyNode>().forEach { node ->
            when (node) {
                is WorldEconomyNode -> Unit
                is CountryEconomyNode -> Unit
                is ProvinceEconomyNode -> Unit
                is SettlementEconomyNode -> {
                    node.settlement.resourceLedger = ResourceLedger.build {
                        record(report, node, resourceLedgerDetailBuilder)
                    }
                }
            }
        }
    }

}