package de.ruegnerlukas.strategygame.backend.economy.ledger

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType

class LedgerResourceEntry(
    val resourceType: ResourceType,
    var amount: Float,
    var missing: Float,
    val details: MutableList<LedgerResourceDetail>
) {

    fun add(amount: Float, detail: LedgerResourceDetail) {
        this.amount += amount
        this.addDetail(detail)
    }

    fun addMissing(amount: Float, detail: LedgerResourceDetail) {
        this.missing += amount
        this.addDetail(detail)
    }

    private fun addDetail(detail: LedgerResourceDetail) {
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