package io.github.smiley4.strategygame.backend.engine.module.core.economy.entity

import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyEntity

sealed interface GameEconomyEntity : EconomyEntity {
    fun detailKey(): String
}