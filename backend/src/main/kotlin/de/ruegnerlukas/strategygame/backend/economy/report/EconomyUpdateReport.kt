package de.ruegnerlukas.strategygame.backend.economy.report

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode

class EconomyUpdateReport {

    private val entries = mutableListOf<ReportEntry>()

    fun addConsumption(
        entity: EconomyEntity,
        fromNode: EconomyNode,
        resources: ResourceCollection,
    ) {
        add(
            ConsumptionReportEntry(
                entity = entity,
                fromNode = fromNode,
                resources = resources
            )
        )
    }

    fun addProduction(
        entity: EconomyEntity,
        inNode: EconomyNode,
        resources: ResourceCollection,
    ) {
        add(
            ProductionReportEntry(
                entity = entity,
                inNode = inNode,
                resources = resources
            )
        )
    }

    fun addMissingResources(
        entity: EconomyEntity,
        resources: ResourceCollection
    ) {
        add(
            MissingResourcesReportEntry(
                entity = entity,
                resources = resources
            )
        )
    }

    fun add(entry: ReportEntry) {
        entries.add(entry)
    }

    fun getEntries(): List<ReportEntry> = entries

}