package de.ruegnerlukas.strategygame.backend.gameengine.core.eco

import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Province
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.economy.core.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.economy.core.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.economy.core.data.EconomyNodeStorage
import de.ruegnerlukas.strategygame.backend.economy.core.data.EconomyNodeStorageImpl
import de.ruegnerlukas.strategygame.backend.economy.ports.required.EconomyPopFoodConsumptionProvider

class MarketEconomyNode(
    val provinces: Collection<Province>,
    val game: GameExtended,
    config: GameConfig,
    popFoodConsumption: EconomyPopFoodConsumptionProvider
) : EconomyNode {

    private val storage = EconomyNodeStorageImpl(ResourceCollection.basic())

    private val nodes = mutableListOf<EconomyNode>().also { nodes ->
        provinces.forEach { province ->
            nodes.add(ProvinceEconomyNode(province, game, config, popFoodConsumption))
        }
    }

    override fun getStorage(): EconomyNodeStorage = storage

    override fun getChildren(): Collection<EconomyNode> = nodes

    override fun getEntities(): Collection<EconomyEntity> = emptyList()

}