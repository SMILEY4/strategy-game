package de.ruegnerlukas.strategygame.backend.economy.ledger

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType

data class LedgerResourceEntry(
    val resource: ResourceType,
    val amount: Float,
    val missing: Float,
    val details: List<LedgerResourceDetail>
)