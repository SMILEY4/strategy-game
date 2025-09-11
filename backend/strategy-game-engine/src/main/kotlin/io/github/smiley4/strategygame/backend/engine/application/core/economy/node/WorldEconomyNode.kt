package io.github.smiley4.strategygame.backend.engine.application.core.economy.node

import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyEntity
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyNodeStorage

internal class WorldEconomyNode(val game: GameExtended, settlementNetworks: List<Set<Settlement.Id>>) : GameEconomyNode {

    override val storage: EconomyNodeStorage = EconomyNodeStorage.noOp()

    override val children: Collection<EconomyNode> = buildList {
        settlementNetworks.forEach { network ->
            add(NetworkEconomyNode(game, network))
        }
    }

    override val entities: Collection<EconomyEntity> = emptyList()

    override fun toString() = "${WorldEconomyNode::class.simpleName}(game=${game.meta.id})"

}