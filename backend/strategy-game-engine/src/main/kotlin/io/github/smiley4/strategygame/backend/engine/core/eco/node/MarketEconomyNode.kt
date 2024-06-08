package io.github.smiley4.strategygame.backend.engine.core.eco.node

import io.github.smiley4.strategygame.backend.common.models.GameConfig
import io.github.smiley4.strategygame.backend.common.models.resources.ResourceCollection
import io.github.smiley4.strategygame.backend.ecosim.data.EconomyEntity
import io.github.smiley4.strategygame.backend.ecosim.data.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.data.EconomyNodeStorage
import io.github.smiley4.strategygame.backend.ecosim.prebuilt.EconomyNodeStorageImpl
import io.github.smiley4.strategygame.backend.engine.core.eco.EconomyPopFoodConsumptionProvider
import io.github.smiley4.strategygame.backend.engine.ports.models.GameExtended
import io.github.smiley4.strategygame.backend.engine.ports.models.Province


class MarketEconomyNode(
    provinces: Collection<Province>,
    game: GameExtended,
    config: GameConfig,
    popFoodConsumption: EconomyPopFoodConsumptionProvider
) : EconomyNode {

    override val storage: EconomyNodeStorage = EconomyNodeStorageImpl(ResourceCollection.basic())

    override val children: Collection<EconomyNode> = mutableListOf<EconomyNode>().also { nodes ->
        provinces.forEach { province ->
            nodes.add(ProvinceEconomyNode(province, game, config, popFoodConsumption))
        }
    }

    override val entities: Collection<EconomyEntity> = emptyList()

}