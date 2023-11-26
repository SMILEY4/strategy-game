package de.ruegnerlukas.strategygame.backend.economy.report

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode

data class ProductionReportEntry(
    val entity: EconomyEntity,
    val inNode: EconomyNode,
    val resources: ResourceCollection
) : ReportEntry