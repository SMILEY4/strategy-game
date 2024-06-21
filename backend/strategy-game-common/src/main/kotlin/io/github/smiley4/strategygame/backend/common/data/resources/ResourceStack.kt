package io.github.smiley4.strategygame.backend.common.data.resources

data class ResourceStack(
    val type: ResourceType,
    val amount: Float
)

fun ResourceType.amount(amount: Float) = ResourceStack(this, amount)
