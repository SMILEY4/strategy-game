package de.ruegnerlukas.strategygame.backend.gameengine.core.eco.node

import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNodeStorage
import de.ruegnerlukas.strategygame.backend.economy.prebuilt.EconomyNodeStorageImpl
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.EconomyPopFoodConsumptionProvider
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.BuildingEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.PopulationBaseEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.PopulationGrowthEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.ProductionQueueEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Province


class ProvinceEconomyNode(
    val province: Province,
    game: GameExtended,
    config: GameConfig,
    popFoodConsumption: EconomyPopFoodConsumptionProvider
) : EconomyNode {

    companion object {
        var enablePopGrowthEntity = true
    }

    override val storage: EconomyNodeStorage = EconomyNodeStorageImpl(province.resourceLedger.getBalance())

    override val children: Collection<EconomyNode> = emptyList()

    override val entities: Collection<EconomyEntity> = mutableListOf<EconomyEntity>().also { entities ->
        province.findCities(game).forEach { city ->
            entities.add(PopulationBaseEconomyEntity(this, city, popFoodConsumption))
            if (enablePopGrowthEntity) {
                entities.add(PopulationGrowthEconomyEntity(this, city, config))
            }
            city.infrastructure.buildings.forEach { building ->
                entities.add(BuildingEconomyEntity(this, city, building))
            }
            city.infrastructure.productionQueue.firstOrNull()?.also { queueEntry ->
                entities.add(ProductionQueueEconomyEntity(this, queueEntry))
            }
        }
    }

}