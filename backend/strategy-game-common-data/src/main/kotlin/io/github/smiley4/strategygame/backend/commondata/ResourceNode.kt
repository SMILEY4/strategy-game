package io.github.smiley4.strategygame.backend.commondata

data class ResourceNode(
    /**
     * The type of the resource node.
     */
    val type: ResourceType,
    /**
     * The current amount of resources stored in this node.
     */
    var amount: Double,
    /**
     * The max amount that can be stored in this node.
     */
    val maxAmount: Double,
    /**
     * The amount the stored resources change each turn naturally.
     */
    val changeRate: Double,
    /**
     * Whether the node is deleted when the current amount reaches 0.
     */
    val canDeplete: Boolean,
)