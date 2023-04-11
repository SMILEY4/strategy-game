package de.ruegnerlukas.strategygame.backend.core.economy.elements.nodes

import de.ruegnerlukas.strategygame.backend.core.actions.update.PopFoodConsumption
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyNodeStorage
import de.ruegnerlukas.strategygame.backend.core.economy.elements.storage.EconomyNodeStorageImpl
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceCollection

class MarketEconomyNode(
    val provinces: Collection<Province>,
    val game: GameExtended,
    config: GameConfig,
    popFoodConsumption: PopFoodConsumption
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