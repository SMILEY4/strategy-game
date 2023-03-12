package de.ruegnerlukas.strategygame.backend.core.economyV3.elements.nodes

import de.ruegnerlukas.strategygame.backend.core.economyV3.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.core.economyV3.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.core.economyV3.data.EconomyNodeStorage
import de.ruegnerlukas.strategygame.backend.core.economyV3.elements.storage.EconomyNodeStorageImpl
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStats

class MarketEconomyNode(val provinces: Collection<Province>, val game: GameExtended) : EconomyNode {

    private val storage = EconomyNodeStorageImpl(ResourceStats())

    private val nodes = mutableListOf<EconomyNode>().also { nodes ->
        provinces.forEach { province ->
            nodes.add(ProvinceEconomyNode(province, game))
        }
    }

    override fun getStorage(): EconomyNodeStorage = storage

    override fun getChildren(): Collection<EconomyNode> = nodes

    override fun getEntities(): Collection<EconomyEntity> = emptyList()

}