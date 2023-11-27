package de.ruegnerlukas.strategygame.backend.economy.ledger

import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntity

data class LedgerResourceDetail(
    val type: LedgerResourceDetailType,
    val amount: Float,
    val entity: EconomyEntity
)