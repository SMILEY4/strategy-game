package de.ruegnerlukas.strategygame.backend.gameengine.core.eco.node

import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.economy.prebuild.BasicEconomyNode
import de.ruegnerlukas.strategygame.backend.economy.prebuild.EconomyNodeStorageImpl
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
) : BasicEconomyNode(
    storage = EconomyNodeStorageImpl(province.resourcesProducedPrevTurn),
    nodeFactory = { _, _ -> },
    entityFactory = { entities, owner ->
        province.findCities(game).forEach { city ->
            entities.add(PopulationBaseEconomyEntity(owner, city, popFoodConsumption))
            if (enablePopGrowthEntity) {
                entities.add(PopulationGrowthEconomyEntity(owner, city, config))
            }
            city.infrastructure.buildings.forEach { building ->
                entities.add(BuildingEconomyEntity(owner, city, building))
            }
            city.infrastructure.productionQueue.firstOrNull()?.also { queueEntry ->
                entities.add(ProductionQueueEconomyEntity(owner, queueEntry))
            }
        }
    }
) {

    companion object {
        var enablePopGrowthEntity = true
    }

}