package io.github.smiley4.strategygame.backend.commondata

interface ResourceLedger {

    companion object {
        fun empty() = ResourceLedgerImpl()
        fun of(entries: List<ResourceLedgerEntry>) = ResourceLedgerImpl().also { it.setEntries(entries) }
        fun build(builder: ResourceLedgerImpl.() -> Unit) = ResourceLedgerImpl().apply(builder)
    }

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

}