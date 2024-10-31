package io.github.smiley4.strategygame.backend.engine.module.core.economy

import io.github.smiley4.strategygame.backend.commondata.ResourceCollection
import io.github.smiley4.strategygame.backend.commondata.ResourceLedger
import io.github.smiley4.strategygame.backend.ecosim.edge.ConsumptionReportEntry
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyEntity
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNode.Companion.contains
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyReport
import io.github.smiley4.strategygame.backend.ecosim.edge.MissingResourcesReportEntry
import io.github.smiley4.strategygame.backend.ecosim.edge.ProductionReportEntry
import io.github.smiley4.strategygame.backend.engine.module.core.economy.entity.GameEconomyEntity

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
        getEntry(type).consumed.add(getDetailKey(entity), 0f) // todo -> amount?
    }
}


/**
 * Record resources being taken from another node and added to this node.
 * Triggered by a resource consumption by an entity from a node that is not its direct owner.
 */
fun ResourceLedger.recordTakeShare(resources: ResourceCollection, entity: EconomyEntity) {
    resources.forEach(false) { type, amount ->
        getEntry(type).produced.add(getDetailKey(entity), 0f) // todo -> amount?
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
