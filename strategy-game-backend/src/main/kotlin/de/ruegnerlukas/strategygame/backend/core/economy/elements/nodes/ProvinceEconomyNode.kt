package de.ruegnerlukas.strategygame.backend.core.economy.elements.nodes

import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyNodeStorage
import de.ruegnerlukas.strategygame.backend.core.economy.elements.entities.BuildingEconomyEntity
import de.ruegnerlukas.strategygame.backend.core.economy.elements.entities.PopulationBaseEconomyEntity
import de.ruegnerlukas.strategygame.backend.core.economy.elements.entities.PopulationGrowthEconomyEntity
import de.ruegnerlukas.strategygame.backend.core.economy.elements.entities.ProductionQueueEconomyEntity
import de.ruegnerlukas.strategygame.backend.core.economy.elements.storage.EconomyNodeStorageImpl
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Province

class ProvinceEconomyNode(val province: Province, val game: GameExtended, config: GameConfig) : EconomyNode {

    companion object {
        var enablePopGrowthEntity = true
    }

    private val storage = EconomyNodeStorageImpl(province.resourcesProducedPrevTurn)

    private val entities = mutableListOf<EconomyEntity>().also { entities ->
        province.cityIds.map { cityId -> game.cities.find { it.cityId == cityId }!! }.forEach { city ->
            entities.add(PopulationBaseEconomyEntity(this, city, config))
            if (enablePopGrowthEntity) {
                entities.add(PopulationGrowthEconomyEntity(this, city, config))
            }
            city.buildings.forEach { building ->
                entities.add(BuildingEconomyEntity(this, city, building))
            }
            city.productionQueue.firstOrNull()?.also { queueEntry ->
                entities.add(ProductionQueueEconomyEntity(this, queueEntry))
            }
        }
    }

    override fun getStorage(): EconomyNodeStorage = storage

    override fun getChildren(): Collection<EconomyNode> = emptyList()

    override fun getEntities(): Collection<EconomyEntity> = entities

}