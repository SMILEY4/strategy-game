package de.ruegnerlukas.strategygame.backend.economy.report

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode

class EconomyReport {

    private val entries = mutableListOf<EconomyReportEntry>()

    fun addConsumption(entity: EconomyEntity, fromNode: EconomyNode, resources: ResourceCollection) {
        add(
            ConsumptionReportEntry(
                entity = entity,
                fromNode = fromNode,
                resources = resources.copy()
            )
        )
    }

    fun addProduction(entity: EconomyEntity, inNode: EconomyNode, resources: ResourceCollection) {
        add(
            ProductionReportEntry(
                entity = entity,
                inNode = inNode,
                resources = resources.copy()
            )
        )
    }

    fun addMissingResources(entity: EconomyEntity, resources: ResourceCollection) {
        add(
            MissingResourcesReportEntry(
                entity = entity,
                resources = resources.copy()
            )
        )
    }

    fun add(entry: EconomyReportEntry) {
        entries.add(entry)
    }

    fun getEntries(): List<EconomyReportEntry> = entries

}