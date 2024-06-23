package io.github.smiley4.strategygame.backend.engine.module.core.eco.entity

import io.github.smiley4.strategygame.backend.common.models.resources.ResourceCollection
import io.github.smiley4.strategygame.backend.ecosim.module.data.EconomyConsumptionType
import io.github.smiley4.strategygame.backend.ecosim.module.data.EconomyEntityConfig
import io.github.smiley4.strategygame.backend.ecosim.module.data.EconomyEntityUpdateState
import io.github.smiley4.strategygame.backend.ecosim.module.data.EconomyNode
import io.github.smiley4.strategygame.backend.engine.ports.models.ProductionQueueEntry


class ProductionQueueEconomyEntity(
    override val owner: EconomyNode,
    val queueEntry: ProductionQueueEntry
) : GameEconomyEntity {

    override val config: EconomyEntityConfig = EconomyEntityConfig(
        input = queueEntry.getTotalRequiredResources().copy().sub(queueEntry.collectedResources),
        output = ResourceCollection.empty(),
        consumptionType = EconomyConsumptionType.DISTRIBUTED,
        priority = 0.5f,
        isActive = true
    )

    override val state: EconomyEntityUpdateState = EconomyEntityUpdateState(config.input)

}