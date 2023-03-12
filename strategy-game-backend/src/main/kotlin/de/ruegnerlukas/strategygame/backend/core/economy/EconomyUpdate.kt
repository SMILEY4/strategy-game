package de.ruegnerlukas.strategygame.backend.core.economy

import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended

class EconomyUpdate {

    fun update(game: GameExtended) {

        val ctx = EconomyUpdateContext()
        val rootNode = WorldEconomyNode(game)

        rootNode.updateConsumption(ctx)
        rootNode.updateProduction(ctx)

        rootNode.getNodesFlatSubtree()
            .filterIsInstance<ProvinceEconomyNode>()
            .forEach { it.write(ctx) }

    }

}