package io.github.smiley4.strategygame.backend.engine.application.core.economy.node

import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyEntity
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyNodeStorage

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