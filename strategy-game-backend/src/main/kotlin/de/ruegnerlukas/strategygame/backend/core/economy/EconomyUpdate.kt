package de.ruegnerlukas.strategygame.backend.core.economy

import de.ruegnerlukas.strategygame.backend.core.actions.update.MarketNetwork
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended

class EconomyUpdate {

    fun update(game: GameExtended) {

        // build economy-data-tree
        val rootNodes = getMarketNodes(game)

        // update economy
        rootNodes
            .flatMap { it.update() }
            .filter { it.type == EconomyEntityUpdateResultType.MISSING_RESOURCES }

        // flatten tree (nodes only)
        val allNodes = rootNodes.flatMap { it.getNodesFlatSubtree() }

        // write node resources back to game-objects
        allNodes
            .filterIsInstance<ProvinceEconomyNode>()
            .forEach { it.writeToProvince() }

    }

    private fun getMarketNodes(game: GameExtended): List<MarketEconomyNode> {
        val networks = MarketNetwork.networksFrom(game)
        val provincesInNetworks = networks.flatMap { it.getProvinces() }
        val nodes = networks.map { MarketEconomyNode(game, it.getProvinces()) }.toMutableList()
        game.provinces
            .filter { province -> !provincesInNetworks.contains(province) }
            .forEach { nodes.add(MarketEconomyNode(game, listOf(it))) }
        return nodes
    }


}