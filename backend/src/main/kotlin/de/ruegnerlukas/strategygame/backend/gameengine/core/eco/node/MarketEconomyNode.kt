package de.ruegnerlukas.strategygame.backend.gameengine.core.eco.node

import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNodeStorage
import de.ruegnerlukas.strategygame.backend.economy.prebuilt.EconomyNodeStorageImpl
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.EconomyPopFoodConsumptionProvider
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Province


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