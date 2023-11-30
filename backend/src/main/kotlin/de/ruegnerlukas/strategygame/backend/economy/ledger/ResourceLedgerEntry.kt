package de.ruegnerlukas.strategygame.backend.economy.ledger

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType

class ResourceLedgerEntry(
    val resourceType: ResourceType,
    var amount: Float,
    var missing: Float,
    val details: MutableList<ResourceLedgerDetail>
) {

    fun add(amount: Float, detail: ResourceLedgerDetail) {
        this.amount += amount
        this.addDetail(detail)
    }

    fun addMissing(amount: Float, detail: ResourceLedgerDetail) {
        this.missing += amount
        this.addDetail(detail)
    }

    private fun addDetail(detail: ResourceLedgerDetail) {
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