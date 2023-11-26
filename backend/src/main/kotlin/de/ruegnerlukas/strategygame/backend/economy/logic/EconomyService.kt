package de.ruegnerlukas.strategygame.backend.economy.logic

import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode.Companion.collectEntities
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyUpdateState
import de.ruegnerlukas.strategygame.backend.economy.report.EconomyUpdateReport

class EconomyService {

    private val consumptionNodeUpdateService = ConsumptionNodeUpdateService(ConsumptionEntityUpdateService())
    private val productionNodeUpdateService = ProductionNodeUpdateService(ProductionEntityUpdateService())

    fun update(root: EconomyNode): EconomyUpdateReport {
        val report = EconomyUpdateReport()
        consumptionNodeUpdateService.update(root, report)
        productionNodeUpdateService.update(root, report)
        reportMissingResources(root, report)
        return report
    }

    private fun reportMissingResources(root: EconomyNode, report: EconomyUpdateReport) {
        root.collectEntities()
            .filter { it.config.isActive }
            .filter { it.state.state == EconomyUpdateState.CONSUME }
            .forEach { report.addMissingResources(it, it.state.getRemainingRequired()) }
    }

}