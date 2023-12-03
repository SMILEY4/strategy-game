package de.ruegnerlukas.strategygame.backend.economy.data


interface EconomyEntity {
    val owner: EconomyNode
    val config: EconomyEntityConfig
    val state: EconomyEntityUpdateState
}