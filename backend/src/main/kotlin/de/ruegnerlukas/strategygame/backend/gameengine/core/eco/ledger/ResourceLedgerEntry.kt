package de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger

import de.ruegnerlukas.strategygame.backend.common.detaillog.DetailLog
import de.ruegnerlukas.strategygame.backend.common.detaillog.DetailLogEntry
import de.ruegnerlukas.strategygame.backend.common.detaillog.DetailLogValue
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType


class ResourceLedgerEntry(
    val resourceType: ResourceType,
    var produced: Float,
    var consumed: Float,
    var missing: Float,
    details: MutableList<DetailLogEntry<ResourceLedgerDetailType>> = mutableListOf()
) : DetailLog<ResourceLedgerDetailType>(details) {

    fun addProduced(id: ResourceLedgerDetailType, amount: Float, data: MutableMap<String, DetailLogValue>) {
        this.produced += amount
        this.mergeDetail(id, data)
    }

    fun addConsumed(id: ResourceLedgerDetailType, amount: Float, data: MutableMap<String, DetailLogValue>) {
        this.consumed += amount
        this.mergeDetail(id, data)
    }

    fun addMissing(id: ResourceLedgerDetailType, amount: Float, data: MutableMap<String, DetailLogValue>) {
        this.missing += amount
        this.mergeDetail(id, data)
    }

}