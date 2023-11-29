package de.ruegnerlukas.strategygame.backend.economy.ledger

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType

class EconomyLedgerEntry(
    val resourceType: ResourceType,
    var amount: Float,
    var missing: Float,
    val details: MutableList<EconomyLedgerDetail>
) {

    fun add(amount: Float, detail: EconomyLedgerDetail) {
        this.amount += amount
        this.addDetail(detail)
    }

    fun addMissing(amount: Float, detail: EconomyLedgerDetail) {
        this.missing += amount
        this.addDetail(detail)
    }

    private fun addDetail(detail: EconomyLedgerDetail) {
        var merged = false
        for (d in details) {
            if (d.merge(detail)) {
                merged = true
                break
            }
        }
        if (!merged) {
            details.add(detail)
        }
    }

}