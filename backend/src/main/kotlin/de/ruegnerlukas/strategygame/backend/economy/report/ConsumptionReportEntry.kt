package de.ruegnerlukas.strategygame.backend.economy.report

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode

data class ConsumptionReportEntry(
    val entity: EconomyEntity,
    val fromNode: EconomyNode,
    val resources: ResourceCollection
) : ReportEntry