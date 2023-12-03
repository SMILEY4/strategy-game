package de.ruegnerlukas.strategygame.backend.gameengine.core.eco.node

import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNodeStorage
import de.ruegnerlukas.strategygame.backend.economy.prebuilt.NoOpEconomyNodeStorageImpl
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.EconomyPopFoodConsumptionProvider
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ProvinceNetwork
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended


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