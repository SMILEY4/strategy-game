package de.ruegnerlukas.strategygame.backend.core.economyV3.elements.nodes

import de.ruegnerlukas.strategygame.backend.core.actions.update.MarketNetwork
import de.ruegnerlukas.strategygame.backend.core.economyV3.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.core.economyV3.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.core.economyV3.data.EconomyNodeStorage
import de.ruegnerlukas.strategygame.backend.core.economyV3.elements.storage.BlockingEconomyNodeStorageImpl
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended

class WorldEconomyNode(val game: GameExtended) : EconomyNode {

    private val storage = BlockingEconomyNodeStorageImpl()

    private val nodes = mutableListOf<MarketEconomyNode>().also { nodes ->
        val networks = MarketNetwork.networksFrom(game)
        val provincesInNetworks = networks.flatMap { it.getProvinces() }
        networks.forEach { nodes.add(MarketEconomyNode(it.getProvinces(), game)) }
        game.provinces
            .filter { province -> !provincesInNetworks.contains(province) }
            .forEach { nodes.add(MarketEconomyNode(listOf(it), game)) }
    }

    override fun getStorage(): EconomyNodeStorage = storage

    override fun getChildren(): Collection<EconomyNode> = nodes

    override fun getEntities(): Collection<EconomyEntity> = emptyList()

}