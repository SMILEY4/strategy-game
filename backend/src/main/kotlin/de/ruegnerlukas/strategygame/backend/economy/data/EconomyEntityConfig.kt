package de.ruegnerlukas.strategygame.backend.economy.data

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection


data class EconomyEntityConfig(
    val input: ResourceCollection,
    val output: ResourceCollection,
    val consumptionType: EconomyConsumptionType,
    val priority: Float,
    val isActive: Boolean,
)
