package io.github.smiley4.strategygame.backend.engine.application.core.economy.node

import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyEntity
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyNodeStorage

internal class NetworkEconomyNode(game: GameExtended, settlements: Set<Settlement.Id>) : GameEconomyNode {

    override val storage: EconomyNodeStorage = EconomyNodeStorage.empty()

    override val children: Collection<EconomyNode> = buildList {
        settlements.map { game.findSettlement(it) }.forEach { settlement ->
            add(SettlementEconomyNode(settlement))
        }
    }

    override val entities: Collection<EconomyEntity> = emptyList()

    override fun toString() = NetworkEconomyNode::class.simpleName.toString()

}