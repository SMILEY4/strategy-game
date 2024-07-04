package io.github.smiley4.strategygame.backend.engine.module.core.eco.node

import io.github.smiley4.strategygame.backend.common.models.GameConfig
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyEntity
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNodeStorage
import io.github.smiley4.strategygame.backend.ecosim.module.prebuilt.NoOpEconomyNodeStorageImpl
import io.github.smiley4.strategygame.backend.engine.core.eco.EconomyPopFoodConsumptionProvider
import io.github.smiley4.strategygame.backend.engine.core.eco.ProvinceNetwork
import io.github.smiley4.strategygame.backend.engine.ports.models.GameExtended


class WorldEconomyNode(game: GameExtended, config: GameConfig, popFoodConsumption: EconomyPopFoodConsumptionProvider) : EconomyNode {

    override val storage: EconomyNodeStorage = NoOpEconomyNodeStorageImpl()

    override val children: Collection<EconomyNode> = mutableListOf<EconomyNode>().also { nodes ->
        val networks = ProvinceNetwork.networksFrom(game)
        val provincesInNetworks = networks.flatMap { it.getProvinces() }
        networks.forEach { nodes.add(MarketEconomyNode(it.getProvinces(), game, config, popFoodConsumption)) }
        game.provinces
            .filter { province -> !provincesInNetworks.contains(province) }
            .forEach { nodes.add(MarketEconomyNode(listOf(it), game, config, popFoodConsumption)) }
    }

    override val entities: Collection<EconomyEntity> = emptyList()

}