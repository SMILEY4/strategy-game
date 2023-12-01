package de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger

import de.ruegnerlukas.strategygame.backend.common.detaillog.DetailLog
import de.ruegnerlukas.strategygame.backend.common.detaillog.DetailLogEntry
import de.ruegnerlukas.strategygame.backend.common.detaillog.DetailLogValue
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType


class ResourceLedgerEntry(
    val resourceType: ResourceType,
    var amount: Float,
    var missing: Float,
    details: MutableList<DetailLogEntry<ResourceLedgerDetailType>> = mutableListOf()
): DetailLog<ResourceLedgerDetailType>(details) {

    fun add(id: ResourceLedgerDetailType, amount: Float, data: MutableMap<String,DetailLogValue>) {
        this.amount += amount
        this.addDetail(id, data)
    }

    fun addMissing(id: ResourceLedgerDetailType, amount: Float, data: MutableMap<String,DetailLogValue>) {
        this.missing += amount
        this.addDetail(id, data)
    }

}