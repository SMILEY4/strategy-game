package io.github.smiley4.strategygame.backend.engine.module.eco.node

import io.github.smiley4.strategygame.backend.commondata.GameConfig
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Province
import io.github.smiley4.strategygame.backend.commondata.ResourceCollection
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyEntity
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNodeStorage
import io.github.smiley4.strategygame.backend.engine.module.eco.EconomyPopFoodConsumptionProvider


class MarketEconomyNode(
    provinces: Collection<Province>,
    game: GameExtended,
    config: GameConfig,
    popFoodConsumption: EconomyPopFoodConsumptionProvider
) : EconomyNode {

    override val storage: EconomyNodeStorage = EconomyNodeStorage.build(ResourceCollection.basic())

    override val children: Collection<EconomyNode> = mutableListOf<EconomyNode>().also { nodes ->
        provinces.forEach { province ->
            nodes.add(ProvinceEconomyNode(province, game, config, popFoodConsumption))
        }
    }

    override val entities: Collection<EconomyEntity> = emptyList()

}