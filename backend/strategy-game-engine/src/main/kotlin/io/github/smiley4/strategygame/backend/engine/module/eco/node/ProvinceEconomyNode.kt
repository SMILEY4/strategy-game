package io.github.smiley4.strategygame.backend.engine.module.eco.node

import io.github.smiley4.strategygame.backend.commondata.GameConfig
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Province
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyEntity
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNodeStorage
import io.github.smiley4.strategygame.backend.engine.module.eco.EconomyPopFoodConsumptionProvider
import io.github.smiley4.strategygame.backend.engine.module.eco.entity.BuildingEconomyEntity
import io.github.smiley4.strategygame.backend.engine.module.eco.entity.PopulationBaseEconomyEntity
import io.github.smiley4.strategygame.backend.engine.module.eco.entity.PopulationGrowthEconomyEntity
import io.github.smiley4.strategygame.backend.engine.module.eco.entity.ProductionQueueEconomyEntity


class ProvinceEconomyNode(
    val province: Province,
    game: GameExtended,
    config: GameConfig,
    popFoodConsumption: EconomyPopFoodConsumptionProvider
) : EconomyNode {

    companion object {
        var enablePopGrowthEntity = true
    }

    override val storage: EconomyNodeStorage = EconomyNodeStorage.build(province.resourceLedger.getProduced())

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