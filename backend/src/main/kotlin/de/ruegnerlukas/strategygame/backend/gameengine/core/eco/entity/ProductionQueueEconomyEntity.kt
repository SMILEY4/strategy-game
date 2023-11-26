package de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity

import de.ruegnerlukas.strategygame.backend.economy.prebuild.BasicEconomyEntity
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.ProductionQueueEntry

class ProductionQueueEconomyEntity(
    val owner: EconomyNode,
    val queueEntry: ProductionQueueEntry
) : BasicEconomyEntity(
    owner = owner,
    priority = 0.5f,
    resourcesInput = queueEntry.getTotalRequiredResources().copy().sub(queueEntry.collectedResources),
    allowPartialInput = true,
)