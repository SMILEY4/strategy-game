//package de.ruegnerlukas.strategygame.backend.economy.ledger
//
//import de.ruegnerlukas.strategygame.backend.common.detaillog.DetailLogValue
//import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
//import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType
//import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntity
//import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode
//import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode.Companion.contains
//import de.ruegnerlukas.strategygame.backend.economy.report.ConsumptionReportEntry
//import de.ruegnerlukas.strategygame.backend.economy.report.EconomyReport
//import de.ruegnerlukas.strategygame.backend.economy.report.MissingResourcesReportEntry
//import de.ruegnerlukas.strategygame.backend.economy.report.ProductionReportEntry
//import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.ResourceLedgerDetailBuilder
//
//data class ResourceLedger(val detailBuilder: ResourceLedgerDetailBuilder) {
//
//    private val entries: MutableList<ResourceLedgerEntry> = mutableListOf()
//
//
//    /**
//     * Replaces all entries with the given entries
//     */
//    fun setEntries(entries: List<ResourceLedgerEntry>) {
//        this.entries.clear()
//        this.entries.addAll(entries)
//    }
//
//
//    /**
//     * @return all resource entries of this ledger
//     */
//    fun getEntries(): List<ResourceLedgerEntry> {
//        return this.entries
//    }
//
//
//    /**
//     * Get the current resource balance (i.e. produced - consumed)
//     */
//    fun getBalance(): ResourceCollection {
//        return ResourceCollection.basic().also { balance ->
//            entries.forEach { entry ->
//                balance.add(entry.resourceType, entry.amount)
//            }
//        }
//    }
//
//
//    /**
//     * Record resources being produced and added to this node
//     */
//    fun recordProduce(resources: ResourceCollection, entity: EconomyEntity) {
//        resources.forEach(false) { type, amount ->
//            val (id, data) = detailBuilder.produce(amount, entity)
//            getEntry(type).add(id, amount, data)
//        }
//    }
//
//
//    /**
//     * Record resources being consumed and removed from this node
//     */
//    fun recordConsume(resources: ResourceCollection, entity: EconomyEntity) {
//        resources.forEach(false) { type, amount ->
//            val (id, data) = detailBuilder.consume(amount, entity)
//            getEntry(type).add(id, -amount, data)
//        }
//    }
//
//
//    /**
//     * Record resources being given to another node and removed from this node
//     */
//    fun recordGiveShare(resources: ResourceCollection, entity: EconomyEntity) {
//        resources.forEach(false) { type, amount ->
//            val (id, data) = detailBuilder.giveShare(amount, entity)
//            getEntry(type).add(id, -amount, data)
//        }
//    }
//
//
//    /**
//     * Record resources being taken from another node and added to this node
//     */
//    fun recordTakeShare(resources: ResourceCollection, entity: EconomyEntity) {
//        resources.forEach(false) { type, amount ->
//            val (id, data) = detailBuilder.takeShare(amount, entity)
//            getEntry(type).add(id, amount, data)
//        }
//    }
//
//
//    /**
//     * Record required resources missing in this node
//     */
//    fun recordMissing(resources: ResourceCollection, entity: EconomyEntity) {
//        resources.forEach(false) { type, amount ->
//            val (id, data) = detailBuilder.missing(amount, entity)
//            getEntry(type).addMissing(id, amount, data)
//        }
//    }
//
//
//    fun record(resources: ResourceCollection, detail: (type: ResourceType, amount: Float) -> Pair<String, MutableMap<String, DetailLogValue>>) {
//        resources.forEach(false) { type, amount ->
//            val (id, data) = detail(type, amount)
//            getEntry(type).add(id, amount, data)
//        }
//    }
//
//
//    fun record(report: EconomyReport, root: EconomyNode) {
//        report.getEntries().forEach { entry ->
//            when (entry) {
//                is ProductionReportEntry -> {
//                    if (entry.resources.isNotZero() && root.contains(entry.inNode)) {
//                        this.recordProduce(entry.resources, entry.entity)
//                    }
//                }
//                is ConsumptionReportEntry -> {
//                    if (entry.resources.isNotZero()) {
//                        val containsFrom = root.contains(entry.fromNode)
//                        val containsOwner = root.contains(entry.entity.owner)
//                        if (containsOwner) {
//                            this.recordConsume(entry.resources, entry.entity)
//                        }
//                        if (entry.fromNode != entry.entity.owner && containsFrom != containsOwner) {
//                            if (containsFrom) {
//                                this.recordGiveShare(entry.resources, entry.entity)
//                            }
//                            if (containsOwner) {
//                                this.recordTakeShare(entry.resources, entry.entity)
//                            }
//                        }
//                    }
//                }
//                is MissingResourcesReportEntry -> {
//                    if (entry.resources.isNotZero() && root.contains(entry.entity.owner)) {
//                        this.recordMissing(entry.resources, entry.entity)
//                    }
//                }
//            }
//        }
//    }
//
//
//    private fun getEntry(type: ResourceType): ResourceLedgerEntry {
//        return entries
//            .find { it.resourceType == type }
//            ?: ResourceLedgerEntry(
//                resourceType = type,
//                amount = 0F,
//                missing = 0F,
//            ).also { entries.add(it) }
//    }
//
//}