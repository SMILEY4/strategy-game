package io.github.smiley4.strategygame.backend.ecosim.edge

import io.github.smiley4.strategygame.backend.commondata.ResourceCollection
import io.github.smiley4.strategygame.backend.commondata.ResourceLedger
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNode.Companion.contains
import io.github.smiley4.strategygame.backend.ecosim.module.ledger.ResourceLedgerDetailBuilder

/**
 * Record all reported changes.
 */
fun ResourceLedger.record(report: EconomyReport, root: EconomyNode, detailBuilder: ResourceLedgerDetailBuilder) {
    report.getEntries().forEach { entry ->
        when (entry) {
            is ProductionReportEntry -> {
                if (entry.resources.isNotZero() && root.contains(entry.inNode)) {
                    this.recordProduce(entry.resources, entry.entity, detailBuilder)
                }
            }
            is ConsumptionReportEntry -> {
                if (entry.resources.isNotZero()) {
                    val containsFrom = root.contains(entry.fromNode)
                    val containsOwner = root.contains(entry.entity.owner)
                    if (containsOwner) {
                        this.recordConsume(entry.resources, entry.entity, detailBuilder)
                    }
                    if (entry.fromNode != entry.entity.owner && containsFrom != containsOwner) {
                        if (containsFrom) {
                            this.recordGiveShare(entry.resources, entry.entity, detailBuilder)
                        }
                        if (containsOwner) {
                            this.recordTakeShare(entry.resources, entry.entity, detailBuilder)
                        }
                    }
                }
            }
            is MissingResourcesReportEntry -> {
                if (entry.resources.isNotZero() && root.contains(entry.entity.owner)) {
                    this.recordMissing(entry.resources, entry.entity, detailBuilder)
                }
            }
        }
    }
}

/**
 * Record resources being produced and added to this node.
 */
fun ResourceLedger.recordProduce(resources: ResourceCollection, entity: EconomyEntity, detailBuilder: ResourceLedgerDetailBuilder) {
    resources.forEach(false) { type, amount ->
        val (id, data) = detailBuilder.produce(amount, entity)
        getEntry(type).addProduced(id, amount, data)
    }
}


/**
 * Record resources being consumed and removed from this node.
 */
fun ResourceLedger.recordConsume(resources: ResourceCollection, entity: EconomyEntity, detailBuilder: ResourceLedgerDetailBuilder) {
    resources.forEach(false) { type, amount ->
        val (id, data) = detailBuilder.consume(amount, entity)
        getEntry(type).addConsumed(id, amount, data)
    }
}


/**
 * Record resources being given to another node and removed from this node.
 * Triggered by a resource consumption by an entity from a node that is not its direct owner.
 */
fun ResourceLedger.recordGiveShare(resources: ResourceCollection, entity: EconomyEntity, detailBuilder: ResourceLedgerDetailBuilder) {
    resources.forEach(false) { type, amount ->
        val (id, data) = detailBuilder.giveShare(amount, entity)
        getEntry(type).addConsumed(id, 0f, data)
    }
}


/**
 * Record resources being taken from another node and added to this node.
 * Triggered by a resource consumption by an entity from a node that is not its direct owner.
 */
fun ResourceLedger.recordTakeShare(resources: ResourceCollection, entity: EconomyEntity, detailBuilder: ResourceLedgerDetailBuilder) {
    resources.forEach(false) { type, amount ->
        val (id, data) = detailBuilder.takeShare(amount, entity)
        getEntry(type).addProduced(id, 0f, data)
    }
}


/**
 * Record required resources missing in this node.
 */
fun ResourceLedger.recordMissing(resources: ResourceCollection, entity: EconomyEntity, detailBuilder: ResourceLedgerDetailBuilder) {
    resources.forEach(false) { type, amount ->
        val (id, data) = detailBuilder.missing(amount, entity)
        getEntry(type).addMissing(id, amount, data)
    }
}
