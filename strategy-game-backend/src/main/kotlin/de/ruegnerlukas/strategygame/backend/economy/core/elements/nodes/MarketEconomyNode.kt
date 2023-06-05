package de.ruegnerlukas.strategygame.backend.economy.core.elements.nodes

import de.ruegnerlukas.strategygame.backend.common.GameConfig
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.models.Province
import de.ruegnerlukas.strategygame.backend.common.models.ResourceCollection
import de.ruegnerlukas.strategygame.backend.economy.core.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.economy.core.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.economy.core.data.EconomyNodeStorage
import de.ruegnerlukas.strategygame.backend.economy.core.elements.storage.EconomyNodeStorageImpl
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