package io.github.smiley4.strategygame.backend.commondata


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