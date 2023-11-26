package de.ruegnerlukas.strategygame.backend.gameengine.core.eco.node

import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.economy.old.prebuild.BasicEconomyNode
import de.ruegnerlukas.strategygame.backend.economy.old.prebuild.BlockingEconomyNodeStorageImpl
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.EconomyPopFoodConsumptionProvider
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ProvinceNetwork
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended

class WorldEconomyNode(
    game: GameExtended,
    config: GameConfig,
    popFoodConsumption: EconomyPopFoodConsumptionProvider
) : BasicEconomyNode(
    storage = BlockingEconomyNodeStorageImpl(),
    nodeFactory = { nodes, _ ->
        val networks = ProvinceNetwork.networksFrom(game)
        val provincesInNetworks = networks.flatMap { it.getProvinces() }
        networks.forEach { nodes.add(MarketEconomyNode(it.getProvinces(), game, config, popFoodConsumption)) }
        game.provinces
            .filter { province -> !provincesInNetworks.contains(province) }
            .forEach { nodes.add(MarketEconomyNode(listOf(it), game, config, popFoodConsumption)) }
    },
    entityFactory = { _, _ -> },
)