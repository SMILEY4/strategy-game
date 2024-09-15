package io.github.smiley4.strategygame.backend.engine.module.core.economy.entity

import io.github.smiley4.strategygame.backend.commondata.ResourceCollection
import io.github.smiley4.strategygame.backend.commondata.ResourceType
import io.github.smiley4.strategygame.backend.commondata.amount
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyConsumptionType
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyEntityConfig
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyEntityUpdateState
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNode

class PopulationGrowthEconomyEntity(override val owner: EconomyNode) : GameEconomyEntity {

    override val config: EconomyEntityConfig = EconomyEntityConfig(
        input = ResourceCollection.basic(
            ResourceType.FOOD.amount(1f)
        ),
        output = ResourceCollection.empty(),
        consumptionType = EconomyConsumptionType.COMPLETE,
        priority = 0f,
        isActive = true
    )

    override val state: EconomyEntityUpdateState = EconomyEntityUpdateState(config.input)

    override fun detailKey() = "population-growth"

    override fun toString() = "${PopulationGrowthEconomyEntity::class.simpleName}"

}