package io.github.smiley4.strategygame.backend.ecosim.data

import io.github.smiley4.strategygame.backend.common.models.resources.ResourceCollection


data class EconomyEntityConfig(
    val input: ResourceCollection,
    val output: ResourceCollection,
    val consumptionType: EconomyConsumptionType,
    val priority: Float,
    val isActive: Boolean,
)
