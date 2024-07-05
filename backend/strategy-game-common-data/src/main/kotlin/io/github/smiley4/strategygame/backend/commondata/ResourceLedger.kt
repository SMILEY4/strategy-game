package io.github.smiley4.strategygame.backend.commondata

interface ResourceLedger {

    /**
     * Replaces all entries with the given entries
     */
    fun setEntries(entries: List<ResourceLedgerEntry>)


    /**
     * @return all resource entries of this ledger
     */
    fun getEntries(): List<ResourceLedgerEntry>


    /**
     * Get the entry for the given resource type
     */
    fun getEntry(type: ResourceType): ResourceLedgerEntry

    /**
     * Get the consumed resources
     */
    fun getConsumed(): ResourceCollection


    /**
     * Get the produced resources
     */
    fun getProduced(): ResourceCollection


    /**
     * Get the currently missing resources
     */
    fun getMissing(): ResourceCollection


    /**
     * Record a consumption, i.e. record resources as removed
     */
    fun recordConsume(
        resources: ResourceCollection,
        detail: (type: ResourceType, amount: Float) -> Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>>
    )


    /**
     * Record a production, i.e. record resources as added
     */
    fun recordProduce(
        resources: ResourceCollection,
        detail: (type: ResourceType, amount: Float) -> Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>>
    )

}