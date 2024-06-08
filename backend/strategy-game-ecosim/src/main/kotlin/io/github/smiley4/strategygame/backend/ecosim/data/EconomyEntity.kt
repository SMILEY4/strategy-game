package io.github.smiley4.strategygame.backend.ecosim.data


interface EconomyEntity {
    val owner: EconomyNode
    val config: EconomyEntityConfig
    val state: EconomyEntityUpdateState
}