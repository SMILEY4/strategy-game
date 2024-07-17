package io.github.smiley4.strategygame.backend.engine.moduleold.eco.entity

import io.github.smiley4.strategygame.backend.commondata.ProductionQueueEntry
import io.github.smiley4.strategygame.backend.commondata.ResourceCollection
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyConsumptionType
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyEntityConfig
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyEntityUpdateState
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNode


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