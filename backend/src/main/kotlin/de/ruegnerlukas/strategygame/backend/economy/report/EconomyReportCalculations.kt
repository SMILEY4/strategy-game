package de.ruegnerlukas.strategygame.backend.economy.report

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode.Companion.collectNodes

class EconomyReportCalculations {

    fun getResourceFlow(report: EconomyUpdateReport, root: EconomyNode): MutableList<ReasonEntry> {

        val reasons = mutableListOf<ReasonEntry>()

        report.getEntries().forEach { entry ->
            when (entry) {
                is ProductionReportEntry -> {
                    if (entry.resources.isNotZero()) {
                        if (root.contains(entry.inNode)) {
                            reasons.add(AddReasonEntry(entry.resources, "produced"))
                        }
                    }
                }
                is ConsumptionReportEntry -> {
                    if (entry.resources.isNotZero()) {
                        if (root.contains(entry.entity.owner)) {
                            reasons.add(RemoveReasonEntry(entry.resources, "consumed"))
                        }
                        if (entry.fromNode != entry.entity.owner) {
                            if (root.contains(entry.fromNode)) {
                                reasons.add(RemoveReasonEntry(entry.resources, "sold"))
                            }
                            if (root.contains(entry.entity.owner)) {
                                reasons.add(AddReasonEntry(entry.resources, "bought"))
                            }
                        }
                    }
                }
                is MissingResourcesReportEntry -> Unit
            }
        }

        return reasons
    }


    private fun EconomyNode.contains(node: EconomyNode): Boolean = this.collectNodes().contains(node)


    sealed class ReasonEntry(
        val resources: ResourceCollection,
        val message: String
    )

    class RemoveReasonEntry(resource: ResourceCollection, message: String) : ReasonEntry(resource, message)
    class AddReasonEntry(resource: ResourceCollection, message: String) : ReasonEntry(resource, message)


}