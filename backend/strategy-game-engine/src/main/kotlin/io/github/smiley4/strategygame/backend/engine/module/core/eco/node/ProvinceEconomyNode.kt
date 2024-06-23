package io.github.smiley4.strategygame.backend.engine.module.core.eco.node

import io.github.smiley4.strategygame.backend.common.models.GameConfig
import io.github.smiley4.strategygame.backend.ecosim.module.data.EconomyEntity
import io.github.smiley4.strategygame.backend.ecosim.module.data.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.module.data.EconomyNodeStorage
import io.github.smiley4.strategygame.backend.ecosim.module.prebuilt.EconomyNodeStorageImpl
import io.github.smiley4.strategygame.backend.engine.core.eco.EconomyPopFoodConsumptionProvider
import io.github.smiley4.strategygame.backend.engine.core.eco.entity.BuildingEconomyEntity
import io.github.smiley4.strategygame.backend.engine.core.eco.entity.PopulationBaseEconomyEntity
import io.github.smiley4.strategygame.backend.engine.core.eco.entity.PopulationGrowthEconomyEntity
import io.github.smiley4.strategygame.backend.engine.core.eco.entity.ProductionQueueEconomyEntity
import io.github.smiley4.strategygame.backend.engine.ports.models.GameExtended
import io.github.smiley4.strategygame.backend.engine.ports.models.Province


class ProvinceEconomyNode(
    val province: Province,
    game: GameExtended,
    config: GameConfig,
    popFoodConsumption: EconomyPopFoodConsumptionProvider
) : EconomyNode {

    companion object {
        var enablePopGrowthEntity = true
    }

    override val storage: EconomyNodeStorage = EconomyNodeStorageImpl(province.resourceLedger.getProduced())

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