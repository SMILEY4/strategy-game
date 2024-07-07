package io.github.smiley4.strategygame.backend.ecosim.edge


interface EconomyEntity {
    val owner: EconomyNode
    val config: EconomyEntityConfig
    val state: EconomyEntityUpdateState
}