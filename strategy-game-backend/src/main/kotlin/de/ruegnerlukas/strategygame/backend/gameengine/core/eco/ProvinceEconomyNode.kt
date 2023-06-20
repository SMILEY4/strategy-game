package de.ruegnerlukas.strategygame.backend.gameengine.core.eco

import de.ruegnerlukas.strategygame.backend.economy.core.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.models.Province
import de.ruegnerlukas.strategygame.backend.economy.core.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.economy.core.data.EconomyNodeStorage
import de.ruegnerlukas.strategygame.backend.economy.core.data.EconomyNodeStorageImpl
import de.ruegnerlukas.strategygame.backend.economy.ports.required.EconomyPopFoodConsumptionProvider

class ProvinceEconomyNode(
    val province: Province,
    val game: GameExtended,
    config: GameConfig,
    popFoodConsumption: EconomyPopFoodConsumptionProvider
) : EconomyNode {

    companion object {
        var enablePopGrowthEntity = true
    }

    private val storage = EconomyNodeStorageImpl(province.resourcesProducedPrevTurn)

    private val entities = mutableListOf<EconomyEntity>().also { entities ->
        province.cityIds.map { cityId -> game.cities.find { it.cityId == cityId }!! }.forEach { city ->
            entities.add(PopulationBaseEconomyEntity(this, city, popFoodConsumption))
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