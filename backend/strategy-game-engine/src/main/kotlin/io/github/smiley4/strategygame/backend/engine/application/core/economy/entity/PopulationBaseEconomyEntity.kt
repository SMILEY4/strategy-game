package io.github.smiley4.strategygame.backend.engine.application.core.economy.entity

import io.github.smiley4.strategygame.backend.commondata.ResourceCollection
import io.github.smiley4.strategygame.backend.commondata.ResourceType
import io.github.smiley4.strategygame.backend.commondata.amount
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyConsumptionType
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyEntityConfig
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyEntityUpdateState
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyNode

class PopulationBaseEconomyEntity(override val owner: EconomyNode) : GameEconomyEntity {

    override val config: EconomyEntityConfig = EconomyEntityConfig(
        input = ResourceCollection.basic(
            ResourceType.FOOD.amount(1f)
        ),
        output = ResourceCollection.empty(),
        consumptionType = EconomyConsumptionType.COMPLETE,
        priority = 2f,
        isActive = true
    )

    override val state: EconomyEntityUpdateState = EconomyEntityUpdateState(config.input)

    override fun detailKey() = "population-base"

    override fun toString() = "${PopulationBaseEconomyEntity::class.simpleName}"

}