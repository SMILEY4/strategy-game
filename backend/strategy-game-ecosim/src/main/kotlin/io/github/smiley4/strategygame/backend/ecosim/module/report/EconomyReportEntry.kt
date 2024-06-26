package io.github.smiley4.strategygame.backend.ecosim.module.report

import io.github.smiley4.strategygame.backend.commondata.ResourceCollection
import io.github.smiley4.strategygame.backend.ecosim.module.data.EconomyEntity
import io.github.smiley4.strategygame.backend.ecosim.module.data.EconomyNode


internal sealed interface EconomyReportEntry {
    val entity: EconomyEntity
}


/**
 * Resources were consumed by the entity from the node (node does not have to be owner of entity)
 */
internal data class ConsumptionReportEntry(
    override val entity: EconomyEntity,
    val fromNode: EconomyNode,
    val resources: ResourceCollection
) : EconomyReportEntry


/**
 * Resources were produced in the node by the entity
 */
internal data class ProductionReportEntry(
    override val entity: EconomyEntity,
    val inNode: EconomyNode,
    val resources: ResourceCollection
) : EconomyReportEntry


/**
 * Resources are missing for the entity
 */
internal data class MissingResourcesReportEntry(
    override val entity: EconomyEntity,
    val resources: ResourceCollection
) : EconomyReportEntry