package de.ruegnerlukas.strategygame.backend.economy.ledger

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode.Companion.collectNodes
import de.ruegnerlukas.strategygame.backend.economy.report.ConsumptionReportEntry
import de.ruegnerlukas.strategygame.backend.economy.report.EconomyUpdateReport
import de.ruegnerlukas.strategygame.backend.economy.report.MissingResourcesReportEntry
import de.ruegnerlukas.strategygame.backend.economy.report.ProductionReportEntry

data class NodeLedger(
    val entries: List<LedgerResourceEntry>
) {

    companion object {

        fun from(report: EconomyUpdateReport, root: EconomyNode): NodeLedger {

            val amounts = mutableMapOf<ResourceType, Float>()
            val missing = mutableMapOf<ResourceType, Float>()
            val details = mutableMapOf<ResourceType, MutableList<LedgerResourceDetail>>()

            fun record(resources: ResourceCollection, add: Boolean, detail: (amount: Float) -> LedgerResourceDetail) {
                resources.forEach(false) { type, amount ->
                    amounts[type] = (amounts[type] ?: 0F) + (if (add) amount else -amount)
                    details.computeIfAbsent(type) { mutableListOf() }.add(detail((if (add) amount else -amount)))
                }
            }

            fun recordMissing(resources: ResourceCollection, detail: (amount: Float) -> LedgerResourceDetail) {
                resources.forEach(false) { type, amount ->
                    missing[type] = (missing[type] ?: 0F) + amount
                    details.computeIfAbsent(type) { mutableListOf() }.add(detail(-amount))
                }
            }


            report.getEntries().forEach { entry ->
                when (entry) {

                    is ProductionReportEntry -> {
                        if (entry.resources.isNotZero() && root.contains(entry.inNode)) {
                            record(entry.resources, true) { amount ->
                                LedgerResourceDetail(LedgerResourceDetailType.PRODUCE, amount, entry.entity)
                            }
                        }
                    }

                    is ConsumptionReportEntry -> {
                        if (entry.resources.isNotZero()) {
                            val containsFrom = root.contains(entry.fromNode)
                            val containsOwner = root.contains(entry.entity.owner)
                            if (containsOwner) {
                                record(entry.resources, false) { amount ->
                                    LedgerResourceDetail(LedgerResourceDetailType.CONSUME, amount, entry.entity)
                                }
                            }
                            if (entry.fromNode != entry.entity.owner && containsFrom != containsOwner) {
                                if (containsFrom) {
                                    record(entry.resources, false) { amount ->
                                        LedgerResourceDetail(LedgerResourceDetailType.SOLD, amount, entry.entity)
                                    }
                                }
                                if (containsOwner) {
                                    record(entry.resources, true) { amount ->
                                        LedgerResourceDetail(LedgerResourceDetailType.BOUGHT, amount, entry.entity)
                                    }
                                }
                            }
                        }
                    }

                    is MissingResourcesReportEntry -> {
                        if (entry.resources.isNotZero() && root.contains(entry.entity.owner)) {
                            recordMissing(entry.resources) { amount ->
                                LedgerResourceDetail(LedgerResourceDetailType.MISSING, amount, entry.entity)
                            }
                        }
                    }
                }
            }


            return ResourceType.values()
                .mapNotNull { resourceType ->
                    if (amounts.containsKey(resourceType)) {
                        LedgerResourceEntry(
                            resource = resourceType,
                            amount = amounts[resourceType] ?: 0F,
                            missing = missing[resourceType] ?: 0F,
                            details = details[resourceType] ?: emptyList()
                        )
                    } else {
                        null
                    }
                }
                .let { NodeLedger(it) }
        }


        private fun EconomyNode.contains(node: EconomyNode): Boolean = this.collectNodes().contains(node)

    }

}