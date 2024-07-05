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
                consumed = 0f,
                produced = 0f,
                missing = 0f,
            ).also { entries.add(it) }
    }

    override fun getConsumed(): ResourceCollection {
        return ResourceCollection.basic().also { balance ->
            entries.forEach { entry ->
                balance.add(entry.resourceType, entry.consumed)
            }
        }
    }

    override fun getProduced(): ResourceCollection {
        return ResourceCollection.basic().also { balance ->
            entries.forEach { entry ->
                balance.add(entry.resourceType, entry.produced)
            }
        }
    }

    override fun getMissing(): ResourceCollection {
        return ResourceCollection.basic().also { balance ->
            entries.forEach { entry ->
                balance.add(entry.resourceType, entry.missing)
            }
        }
    }

    override fun recordConsume(
        resources: ResourceCollection,
        detail: (type: ResourceType, amount: Float) -> Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>>
    ) {
        resources.forEach(false) { type, amount ->
            val (id, data) = detail(type, amount)
            getEntry(type).addConsumed(id, amount, data)
        }
    }

    override fun recordProduce(
        resources: ResourceCollection,
        detail: (type: ResourceType, amount: Float) -> Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>>
    ) {
        resources.forEach(false) { type, amount ->
            val (id, data) = detail(type, amount)
            getEntry(type).addProduced(id, amount, data)
        }
    }

}