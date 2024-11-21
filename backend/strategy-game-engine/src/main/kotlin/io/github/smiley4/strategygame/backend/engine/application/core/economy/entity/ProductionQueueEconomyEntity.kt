package io.github.smiley4.strategygame.backend.engine.application.core.economy.entity

import io.github.smiley4.strategygame.backend.commondata.ProductionQueueEntry
import io.github.smiley4.strategygame.backend.commondata.ResourceCollection
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyConsumptionType
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyEntityConfig
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyEntityUpdateState
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyNode

class ProductionQueueEconomyEntity(override val owner: EconomyNode, val entry: ProductionQueueEntry) : GameEconomyEntity {

    override val config: EconomyEntityConfig = EconomyEntityConfig(
        input = entry.requiredResources.copy().sub(entry.collectedResources),
        output = ResourceCollection.empty(),
        consumptionType = EconomyConsumptionType.DISTRIBUTED,
        priority = 0.5f,
        isActive = true
    )

    override val state: EconomyEntityUpdateState = EconomyEntityUpdateState(config.input)

    override fun detailKey() = "production-queue"

    override fun toString() = "${ProductionQueueEconomyEntity::class.simpleName}"

}