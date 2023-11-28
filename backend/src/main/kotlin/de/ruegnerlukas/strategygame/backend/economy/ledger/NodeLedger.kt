package de.ruegnerlukas.strategygame.backend.economy.ledger

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode.Companion.contains
import de.ruegnerlukas.strategygame.backend.economy.report.ConsumptionReportEntry
import de.ruegnerlukas.strategygame.backend.economy.report.EconomyUpdateReport
import de.ruegnerlukas.strategygame.backend.economy.report.MissingResourcesReportEntry
import de.ruegnerlukas.strategygame.backend.economy.report.ProductionReportEntry

data class NodeLedger(val detailBuilder: LedgerResourceDetailBuilder) {

    private val entries: MutableList<LedgerResourceEntry> = mutableListOf()


    /**
     * @return all resource entries of this ledger
     */
    fun getEntries(): List<LedgerResourceEntry> {
        return this.entries
    }


    /**
     * Record resources being produced and added to this node
     */
    fun recordProduce(resources: ResourceCollection, entity: EconomyEntity) {
        resources.forEach(false) { type, amount ->
            val detail = detailBuilder.produce(amount, entity)
            getEntry(type).add(amount, detail)
        }
    }


    /**
     * Record resources being consumed and removed from this node
     */
    fun recordConsume(resources: ResourceCollection, entity: EconomyEntity) {
        resources.forEach(false) { type, amount ->
            val detail = detailBuilder.consume(amount, entity)
            getEntry(type).add(-amount, detail)
        }
    }


    /**
     * Record resources being given to another node and removed from this node
     */
    fun recordGiveShare(resources: ResourceCollection, entity: EconomyEntity) {
        resources.forEach(false) { type, amount ->
            val detail = detailBuilder.giveShare(amount, entity)
            getEntry(type).add(-amount, detail)
        }
    }


    /**
     * Record resources being taken from another node and added to this node
     */
    fun recordTakeShare(resources: ResourceCollection, entity: EconomyEntity) {
        resources.forEach(false) { type, amount ->
            val detail = detailBuilder.takeShare(amount, entity)
            getEntry(type).add(amount, detail)
        }
    }


    /**
     * Record required resources missing in this node
     */
    fun recordMissing(resources: ResourceCollection, entity: EconomyEntity) {
        resources.forEach(false) { type, amount ->
            val detail = detailBuilder.missing(amount, entity)
            getEntry(type).addMissing(amount, detail)
        }
    }

    fun record(report: EconomyUpdateReport, root: EconomyNode) {
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


    private fun getEntry(type: ResourceType): LedgerResourceEntry {
        return entries
            .find { it.resourceType == type }
            ?: LedgerResourceEntry(
                resourceType = type,
                amount = 0F,
                missing = 0F,
                details = mutableListOf()
            ).also { entries.add(it) }
    }

}