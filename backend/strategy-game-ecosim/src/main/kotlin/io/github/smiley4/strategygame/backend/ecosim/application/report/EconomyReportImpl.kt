package io.github.smiley4.strategygame.backend.ecosim.application.report

import io.github.smiley4.strategygame.backend.commondata.ResourceCollection
import io.github.smiley4.strategygame.backend.ecosim.lib.ConsumptionReportEntry
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyEntity
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyReport
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyReportEntry
import io.github.smiley4.strategygame.backend.ecosim.lib.MissingResourcesReportEntry
import io.github.smiley4.strategygame.backend.ecosim.lib.ProductionReportEntry


internal class EconomyReportImpl : EconomyReport {

    private val entries = mutableListOf<EconomyReportEntry>()

    override fun getEntries(): List<EconomyReportEntry> = entries

    override fun addConsumption(entity: EconomyEntity, fromNode: EconomyNode, resources: ResourceCollection) {
        add(
            ConsumptionReportEntry(
                entity = entity,
                fromNode = fromNode,
                resources = resources.copy()
            )
        )
    }

    override fun addProduction(entity: EconomyEntity, inNode: EconomyNode, resources: ResourceCollection) {
        add(
            ProductionReportEntry(
                entity = entity,
                inNode = inNode,
                resources = resources.copy()
            )
        )
    }

    override fun addMissingResources(entity: EconomyEntity, resources: ResourceCollection) {
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

}