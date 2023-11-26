package de.ruegnerlukas.strategygame.backend.economy.data

enum class EconomyConsumptionType {
    /**
     * The entity must consume ALL required resources from its owner node
     */
    LOCAL,


    /**
     * The entity can consume resources from nodes higher up the tree
     */
    DISTRIBUTED,
}