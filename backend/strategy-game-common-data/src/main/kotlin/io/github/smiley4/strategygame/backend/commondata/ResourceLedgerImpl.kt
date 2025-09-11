package io.github.smiley4.strategygame.backend.commondata

class ResourceLedgerImpl : ResourceLedger {

    private val entries: MutableList<ResourceLedgerEntry> = mutableListOf()


    override fun setEntries(entries: List<ResourceLedgerEntry>) {
        this.entries.clear()
        this.entries.addAll(entries)
    }

    override fun getEntries(): List<ResourceLedgerEntry> {
        return this.entries
    }

    override fun getEntry(type: ResourceType): ResourceLedgerEntry {
        return entries
            .find { it.resourceType == type }
            ?: ResourceLedgerEntry(
                resourceType = type,
                consumed = ResourceLedgerEntry.Value(0f),
                produced = ResourceLedgerEntry.Value(0f),
                missing = ResourceLedgerEntry.Value(0f),
            ).also { entries.add(it) }
    }

    override fun getConsumed(): ResourceCollection {
        return ResourceCollection.basic().also { balance ->
            entries.forEach { entry ->
                balance.add(entry.resourceType, entry.consumed.amount)
            }
        }
    }

    override fun getProduced(): ResourceCollection {
        return ResourceCollection.basic().also { balance ->
            entries.forEach { entry ->
                balance.add(entry.resourceType, entry.produced.amount)
            }
        }
    }

    override fun getMissing(): ResourceCollection {
        return ResourceCollection.basic().also { balance ->
            entries.forEach { entry ->
                balance.add(entry.resourceType, entry.missing.amount)
            }
        }
    }

}