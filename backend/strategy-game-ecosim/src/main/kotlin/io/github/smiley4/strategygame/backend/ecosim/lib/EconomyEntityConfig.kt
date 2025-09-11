package io.github.smiley4.strategygame.backend.ecosim.lib

import io.github.smiley4.strategygame.backend.commondata.ResourceCollection


data class EconomyEntityConfig(
    val input: ResourceCollection,
    val output: ResourceCollection,
    val consumptionType: EconomyConsumptionType,
    val priority: Float,
    val isActive: Boolean,
)
