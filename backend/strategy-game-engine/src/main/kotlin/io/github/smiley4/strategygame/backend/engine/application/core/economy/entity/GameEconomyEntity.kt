package io.github.smiley4.strategygame.backend.engine.application.core.economy.entity

import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyEntity

sealed interface GameEconomyEntity : EconomyEntity {
    fun detailKey(): String
}