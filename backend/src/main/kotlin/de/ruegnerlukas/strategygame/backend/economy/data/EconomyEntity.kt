package de.ruegnerlukas.strategygame.backend.economy.data


interface EconomyEntity {
    fun getOwner(): EconomyNode
    fun getConfig(): EconomyEntityConfig
    fun getState(): EconomyEntityUpdateState
}