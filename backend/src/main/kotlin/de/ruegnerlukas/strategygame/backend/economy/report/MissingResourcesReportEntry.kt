package de.ruegnerlukas.strategygame.backend.economy.report

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntity

data class MissingResourcesReportEntry(
    val entity: EconomyEntity,
    val resources: ResourceCollection
) : ReportEntry