package io.github.smiley4.strategygame.backend.engine.moduleold.eco.node

import io.github.smiley4.strategygame.backend.commondata.GameConfig
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyEntity
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNodeStorage
import io.github.smiley4.strategygame.backend.engine.moduleold.eco.EconomyPopFoodConsumptionProvider
import io.github.smiley4.strategygame.backend.engine.moduleold.eco.ProvinceNetwork


class WorldEconomyNode(game: GameExtended, config: GameConfig, popFoodConsumption: EconomyPopFoodConsumptionProvider) : EconomyNode {

    override val storage: EconomyNodeStorage = EconomyNodeStorage.noOp()

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