package io.github.smiley4.strategygame.backend.engine.core.eco.ledger

import io.github.smiley4.strategygame.backend.common.detaillog.DetailLog
import io.github.smiley4.strategygame.backend.common.detaillog.DetailLogEntry
import io.github.smiley4.strategygame.backend.common.detaillog.DetailLogValue
import io.github.smiley4.strategygame.backend.common.models.resources.ResourceType


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