package de.ruegnerlukas.strategygame.backend.core.economy.elements.nodes

import de.ruegnerlukas.strategygame.backend.core.actions.update.PopFoodConsumption
import de.ruegnerlukas.strategygame.backend.core.actions.update.ProvinceNetwork
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyNodeStorage
import de.ruegnerlukas.strategygame.backend.core.economy.elements.storage.BlockingEconomyNodeStorageImpl
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended

class WorldEconomyNode(
    val game: GameExtended,
    config: GameConfig,
    popFoodConsumption: PopFoodConsumption
) : EconomyNode {

    private val storage = BlockingEconomyNodeStorageImpl()

    private val nodes = mutableListOf<MarketEconomyNode>().also { nodes ->
        val networks = ProvinceNetwork.networksFrom(game)
        val provincesInNetworks = networks.flatMap { it.getProvinces() }
        networks.forEach { nodes.add(MarketEconomyNode(it.getProvinces(), game, config, popFoodConsumption)) }
        game.provinces
            .filter { province -> !provincesInNetworks.contains(province) }
            .forEach { nodes.add(MarketEconomyNode(listOf(it), game, config, popFoodConsumption)) }
    }

    override fun getStorage(): EconomyNodeStorage = storage

    override fun getChildren(): Collection<EconomyNode> = nodes

    override fun getEntities(): Collection<EconomyEntity> = emptyList()

}