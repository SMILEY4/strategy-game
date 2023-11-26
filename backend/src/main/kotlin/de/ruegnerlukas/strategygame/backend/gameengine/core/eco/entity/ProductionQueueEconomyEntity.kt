package de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyConsumptionType
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntityConfig
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntityUpdateState
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.ProductionQueueEntry


class ProductionQueueEconomyEntity(
    override val owner: EconomyNode,
    val queueEntry: ProductionQueueEntry
) : EconomyEntity {

    override val config: EconomyEntityConfig = EconomyEntityConfig(
        input = queueEntry.getTotalRequiredResources().copy().sub(queueEntry.collectedResources),
        output = ResourceCollection.empty(),
        consumptionType = EconomyConsumptionType.DISTRIBUTED,
        priority = 0.5f,
        isActive = true
    )

    override val state: EconomyEntityUpdateState = EconomyEntityUpdateState(config.input)

}