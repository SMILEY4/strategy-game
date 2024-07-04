package io.github.smiley4.strategygame.backend.ecosim.module.data


internal interface EconomyEntity {
    val owner: EconomyNode
    val config: EconomyEntityConfig
    val state: EconomyEntityUpdateState
}