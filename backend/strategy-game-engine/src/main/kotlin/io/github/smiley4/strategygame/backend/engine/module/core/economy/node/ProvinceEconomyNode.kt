package io.github.smiley4.strategygame.backend.engine.module.core.economy.node

import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Province
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyEntity
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNodeStorage

class ProvinceEconomyNode(game: GameExtended, val province: Province) : GameEconomyNode {

    override val storage: EconomyNodeStorage = EconomyNodeStorage.empty()

    override val children: Collection<EconomyNode> = buildList {
        province.settlements.map { game.findSettlement(it) }.forEach { settlement ->
            add(SettlementEconomyNode(settlement))
        }
    }

    override val entities: Collection<EconomyEntity> = emptyList()

    override fun toString() = "${ProvinceEconomyNode::class.simpleName}(province=${province.id})"

}