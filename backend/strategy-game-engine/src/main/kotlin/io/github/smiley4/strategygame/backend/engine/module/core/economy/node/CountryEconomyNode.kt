package io.github.smiley4.strategygame.backend.engine.module.core.economy.node

import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyEntity
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNodeStorage

class CountryEconomyNode(game: GameExtended, val country: Country) : GameEconomyNode {

    override val storage: EconomyNodeStorage = EconomyNodeStorage.empty()

    override val children: Collection<EconomyNode> = buildList {
        game.provinces.filter { it.country == country.id }.forEach { province ->
            add(ProvinceEconomyNode(game, province))
        }
    }

    override val entities: Collection<EconomyEntity> = emptyList()

    override fun toString() = "${CountryEconomyNode::class.simpleName}(country=${country.id})"

}