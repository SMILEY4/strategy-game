package io.github.smiley4.strategygame.backend.engine.core.eco.ledger

import io.github.smiley4.strategygame.backend.common.detaillog.DetailLogValue
import io.github.smiley4.strategygame.backend.common.models.resources.ResourceCollection
import io.github.smiley4.strategygame.backend.common.models.resources.ResourceType
import io.github.smiley4.strategygame.backend.ecosim.data.EconomyEntity
import io.github.smiley4.strategygame.backend.ecosim.data.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.data.EconomyNode.Companion.contains
import io.github.smiley4.strategygame.backend.ecosim.report.ConsumptionReportEntry
import io.github.smiley4.strategygame.backend.ecosim.report.EconomyReport
import io.github.smiley4.strategygame.backend.ecosim.report.MissingResourcesReportEntry
import io.github.smiley4.strategygame.backend.ecosim.report.ProductionReportEntry


class ResourceLedger {

    private val detailBuilder = ResourceLedgerDetailBuilderImpl()

    private val entries: MutableList<ResourceLedgerEntry> = mutableListOf()


    /**
     * Replaces all entries with the given entries
     */
    fun setEntries(entries: List<ResourceLedgerEntry>) {
        this.entries.clear()
        this.entries.addAll(entries)
    }


    /**
     * @return all resource entries of this ledger
     */
    fun getEntries(): List<ResourceLedgerEntry> {
        return this.entries
    }


    /**
     * Get the consumed resources
     */
    fun getConsumed(): ResourceCollection {
        return ResourceCollection.basic().also { balance ->
            entries.forEach { entry ->
                balance.add(entry.resourceType, entry.consumed)
            }
        }
    }


    /**
     * Get the produced resources
     */
    fun getProduced(): ResourceCollection {
        return ResourceCollection.basic().also { balance ->
            entries.forEach { entry ->
                balance.add(entry.resourceType, entry.produced)
            }
        }
    }


    /**
     * Get the currently missing resources
     */
    fun getMissing(): ResourceCollection {
        return ResourceCollection.basic().also { balance ->
            entries.forEach { entry ->
                balance.add(entry.resourceType, entry.missing)
            }
        }
    }


    /**
     * Record resources being produced and added to this node
     */
    fun recordProduce(resources: ResourceCollection, entity: EconomyEntity) {
        resources.forEach(false) { type, amount ->
            val (id, data) = detailBuilder.produce(amount, entity)
            getEntry(type).addProduced(id, amount, data)
        }
    }


    /**
     * Record resources being consumed and removed from this node
     */
    fun recordConsume(resources: ResourceCollection, entity: EconomyEntity) {
        resources.forEach(false) { type, amount ->
            val (id, data) = detailBuilder.consume(amount, entity)
            getEntry(type).addConsumed(id, amount, data)
        }
    }


    /**
     * Record resources being given to another node and removed from this node
     */
    fun recordGiveShare(resources: ResourceCollection, entity: EconomyEntity) {
        resources.forEach(false) { type, amount ->
            val (id, data) = detailBuilder.giveShare(amount, entity)
            getEntry(type).addConsumed(id, 0f, data)
        }
    }


    /**
     * Record resources being taken from another node and added to this node
     */
    fun recordTakeShare(resources: ResourceCollection, entity: EconomyEntity) {
        resources.forEach(false) { type, amount ->
            val (id, data) = detailBuilder.takeShare(amount, entity)
            getEntry(type).addProduced(id, 0f, data)
        }
    }


    /**
     * Record required resources missing in this node
     */
    fun recordMissing(resources: ResourceCollection, entity: EconomyEntity) {
        resources.forEach(false) { type, amount ->
            val (id, data) = detailBuilder.missing(amount, entity)
            getEntry(type).addMissing(id, amount, data)
        }
    }


    fun recordConsume(
        resources: ResourceCollection,
        detail: (type: ResourceType, amount: Float) -> Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>>
    ) {
        resources.forEach(false) { type, amount ->
            val (id, data) = detail(type, amount)
            getEntry(type).addConsumed(id, amount, data)
        }
    }

    fun recordProduce(
        resources: ResourceCollection,
        detail: (type: ResourceType, amount: Float) -> Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>>
    ) {
        resources.forEach(false) { type, amount ->
            val (id, data) = detail(type, amount)
            getEntry(type).addProduced(id, amount, data)
        }
    }


    fun record(report: EconomyReport, root: EconomyNode) {
        report.getEntries().forEach { entry ->
            when (entry) {
                is ProductionReportEntry -> {
                    if (entry.resources.isNotZero() && root.contains(entry.inNode)) {
                        this.recordProduce(entry.resources, entry.entity)
                    }
                }
                is ConsumptionReportEntry -> {
                    if (entry.resources.isNotZero()) {
                        val containsFrom = root.contains(entry.fromNode)
                        val containsOwner = root.contains(entry.entity.owner)
                        if (containsOwner) {
                            this.recordConsume(entry.resources, entry.entity)
                        }
                        if (entry.fromNode != entry.entity.owner && containsFrom != containsOwner) {
                            if (containsFrom) {
                                this.recordGiveShare(entry.resources, entry.entity)
                            }
                            if (containsOwner) {
                                this.recordTakeShare(entry.resources, entry.entity)
                            }
                        }
                    }
                }
                is MissingResourcesReportEntry -> {
                    if (entry.resources.isNotZero() && root.contains(entry.entity.owner)) {
                        this.recordMissing(entry.resources, entry.entity)
                    }
                }
            }
        }
    }


    private fun getEntry(type: ResourceType): ResourceLedgerEntry {
        return entries
            .find { it.resourceType == type }
            ?: ResourceLedgerEntry(
                resourceType = type,
                consumed = 0f,
                produced = 0f,
                missing = 0f,
            ).also { entries.add(it) }
    }

}