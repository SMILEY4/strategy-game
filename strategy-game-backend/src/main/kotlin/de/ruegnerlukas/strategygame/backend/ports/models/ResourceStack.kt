package de.ruegnerlukas.strategygame.backend.ports.models

data class ResourceStack(
    val type: ResourceType,
    val amount: Float
)

fun ResourceType.amount(amount: Float) = ResourceStack(this, amount)
