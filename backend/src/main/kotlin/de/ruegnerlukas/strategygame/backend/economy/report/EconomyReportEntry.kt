package de.ruegnerlukas.strategygame.backend.economy.report

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode

sealed interface EconomyReportEntry {
    val entity: EconomyEntity
}


/**
 * Resources were consumed by the entity from the node (node does not have to be owner of entity)
 */
data class ConsumptionReportEntry(
    override val entity: EconomyEntity,
    val fromNode: EconomyNode,
    val resources: ResourceCollection
) : EconomyReportEntry


/**
 * Resources were produced in the node by the entity
 */
data class ProductionReportEntry(
    override val entity: EconomyEntity,
    val inNode: EconomyNode,
    val resources: ResourceCollection
) : EconomyReportEntry


/**
 * Resources are missing for the entity
 */
data class MissingResourcesReportEntry(
    override val entity: EconomyEntity,
    val resources: ResourceCollection
) : EconomyReportEntry