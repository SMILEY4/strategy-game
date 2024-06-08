package io.github.smiley4.strategygame.backend.engine.core.eco.entity

import io.github.smiley4.strategygame.backend.common.models.resources.ResourceCollection
import io.github.smiley4.strategygame.backend.ecosim.data.EconomyConsumptionType
import io.github.smiley4.strategygame.backend.ecosim.data.EconomyEntityConfig
import io.github.smiley4.strategygame.backend.ecosim.data.EconomyEntityUpdateState
import io.github.smiley4.strategygame.backend.ecosim.data.EconomyNode
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