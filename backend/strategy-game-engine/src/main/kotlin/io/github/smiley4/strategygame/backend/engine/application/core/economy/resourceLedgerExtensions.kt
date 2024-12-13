package io.github.smiley4.strategygame.backend.engine.application.core.economy

import io.github.smiley4.strategygame.backend.commondata.ResourceCollection
import io.github.smiley4.strategygame.backend.commondata.ResourceLedger
import io.github.smiley4.strategygame.backend.ecosim.lib.ConsumptionReportEntry
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyEntity
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyNode.Companion.contains
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyReport
import io.github.smiley4.strategygame.backend.ecosim.lib.MissingResourcesReportEntry
import io.github.smiley4.strategygame.backend.ecosim.lib.ProductionReportEntry
import io.github.smiley4.strategygame.backend.engine.application.core.economy.entity.GameEconomyEntity

/**
 * Record all reported changes associated with the given root node.
 */
fun ResourceLedger.record(report: EconomyReport, root: EconomyNode) {
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
                    val isShared = entry.fromNode != entry.entity.owner
                    if (containsFrom && containsOwner) {
                        // The node the resources were taken from and the node that owns the entity are
                        // both either the current node or children of the current node.
                        // Count the resources as being consumed from this node by this node
                        this.recordConsume(entry.resources, entry.entity)
                    }
                    if (isShared && containsFrom && !containsOwner) {
                        // The resources were taken from the current subtree but the consumer of the consumer is not part of this subtree.
                        // Count the resources as actually being consumed somewhere else but taken from the storage of the current node.
                        this.recordGiveShare(entry.resources, entry.entity)
                    }
                    if (isShared && containsOwner && !containsFrom) {
                        // The consumer is part of the current subtree but the resources were taken from a node that is NOT part of the current subtree.
                        // Count the resources as being consumed here but taken from somewhere else.
                        this.recordTakeShare(entry.resources, entry.entity)
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


/**
 * Record resources being produced and added to this node.
 */
fun ResourceLedger.recordProduce(resources: ResourceCollection, entity: EconomyEntity) {
    resources.forEach(false) { type, amount ->
        getEntry(type).produced.add(getDetailKey(entity), amount)
    }
}


/**
 * Record resources being consumed and removed from this node.
 */
fun ResourceLedger.recordConsume(resources: ResourceCollection, entity: EconomyEntity) {
    resources.forEach(false) { type, amount ->
        getEntry(type).consumed.add(getDetailKey(entity), amount)
    }
}


/**
 * Record resources being given to another node and removed from this node.
 * Triggered by a resource consumption by an entity from a node that is not its direct owner.
 */
fun ResourceLedger.recordGiveShare(resources: ResourceCollection, entity: EconomyEntity) {
    resources.forEach(false) { type, amount ->
        getEntry(type).consumed.add("trade:${getDetailKey(entity)}", amount)
    }
}


/**
 * Record resources being taken from another node and added to this node.
 * Triggered by a resource consumption by an entity from a node that is not its direct owner.
 */
fun ResourceLedger.recordTakeShare(resources: ResourceCollection, entity: EconomyEntity) {
    resources.forEach(false) { type, amount ->
        getEntry(type).produced.add("trade:${getDetailKey(entity)}", amount)
    }
}


/**
 * Record required resources missing in this node.
 */
fun ResourceLedger.recordMissing(resources: ResourceCollection, entity: EconomyEntity) {
    resources.forEach(false) { type, amount ->
        getEntry(type).missing.add(getDetailKey(entity), amount)
    }
}

private fun getDetailKey(entity: EconomyEntity): String {
    return when (entity) {
        is GameEconomyEntity -> entity.detailKey()
        else -> "unknown"
    }
}
