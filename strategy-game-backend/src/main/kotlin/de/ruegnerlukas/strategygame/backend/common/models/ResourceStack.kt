package de.ruegnerlukas.strategygame.backend.common.models

data class ResourceStack(
    val type: ResourceType,
    val amount: Float
)

fun ResourceType.amount(amount: Float) = ResourceStack(this, amount)
