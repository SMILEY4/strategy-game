package de.ruegnerlukas.strategygame.backend.core.economy.elements.nodes

import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyNodeStorage
import de.ruegnerlukas.strategygame.backend.core.economy.elements.storage.EconomyNodeStorageImpl
import de.ruegnerlukas.strategygame.backend.core.economy.elements.entities.BuildingEconomyEntity
import de.ruegnerlukas.strategygame.backend.core.economy.elements.entities.PopulationEconomyEntity
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Province

class ProvinceEconomyNode(val province: Province, val game: GameExtended) : EconomyNode {

    private val storage = EconomyNodeStorageImpl(province.resourcesProducedPrevTurn)

    private val entities = mutableListOf<EconomyEntity>().also { entities ->
        province.cityIds.map { cityId -> game.cities.find { it.cityId == cityId }!! }.forEach { city ->
            entities.add(PopulationEconomyEntity(this, city))
            city.buildings.forEach { building ->
                entities.add(BuildingEconomyEntity(this, city, building))
            }
        }
    }

    override fun getStorage(): EconomyNodeStorage = storage

    override fun getChildren(): Collection<EconomyNode> = emptyList()

    override fun getEntities(): Collection<EconomyEntity> = entities

}