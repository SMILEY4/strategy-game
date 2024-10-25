package io.github.smiley4.strategygame.backend.engine.module.core.economy.node

import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyEntity
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNodeStorage

internal class WorldEconomyNode(val game: GameExtended) : GameEconomyNode {

    override val storage: EconomyNodeStorage = EconomyNodeStorage.noOp()

    override val children: Collection<EconomyNode> = buildList {
        game.countries.forEach { country ->
            add(CountryEconomyNode(game, country))
        }
    }

    override val entities: Collection<EconomyEntity> = emptyList()

    override fun toString() = "${WorldEconomyNode::class.simpleName}(game=${game.meta.id})"

}