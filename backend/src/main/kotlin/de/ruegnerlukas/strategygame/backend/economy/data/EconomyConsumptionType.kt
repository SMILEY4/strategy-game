package de.ruegnerlukas.strategygame.backend.economy.data

enum class EconomyConsumptionType {
    /**
     * The entity must consume ALL required resources from one node all at once.
     */
    COMPLETE,


    /**
     * The entity can consume resources from multiple nodes. Resources will be consumed even if the required amount is not reached.
     */
    DISTRIBUTED,
}