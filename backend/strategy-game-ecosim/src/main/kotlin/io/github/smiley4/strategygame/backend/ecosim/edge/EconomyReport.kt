package io.github.smiley4.strategygame.backend.ecosim.edge

interface EconomyReport {
    fun getEntries(): List<EconomyReportEntry>
//    fun addConsumption(entity: EconomyEntity, fromNode: EconomyNode, resources: ResourceCollection)
//    fun addProduction(entity: EconomyEntity, inNode: EconomyNode, resources: ResourceCollection)
//    fun addMissingResources(entity: EconomyEntity, resources: ResourceCollection)
}