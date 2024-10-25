package io.github.smiley4.strategygame.backend.ecosim.edge

enum class EconomyConsumptionType {
    /**
     * The entity must consume all input resources in the same node.
     * This node does not need to be the direct parent node, but can be higher up in the tree.
     * Either all required resources are consumed or none.
     */
    COMPLETE,


    /**
     * The entity can consume resources from multiple nodes. Resources will be consumed even if the required amount is not reached.
     */
    DISTRIBUTED,
}