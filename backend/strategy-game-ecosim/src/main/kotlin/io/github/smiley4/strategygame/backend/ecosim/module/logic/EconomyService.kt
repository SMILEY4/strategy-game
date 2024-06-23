package io.github.smiley4.strategygame.backend.ecosim.module.logic

import io.github.smiley4.strategygame.backend.ecosim.module.data.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.module.data.EconomyNode.Companion.collectEntities
import io.github.smiley4.strategygame.backend.ecosim.module.data.EconomyUpdateState
import io.github.smiley4.strategygame.backend.ecosim.module.report.EconomyReport

internal class EconomyService {

    private val consumptionNodeUpdateService = ConsumptionNodeUpdateService(ConsumptionEntityUpdateService())
    private val productionNodeUpdateService = ProductionNodeUpdateService(ProductionEntityUpdateService())

    fun update(root: EconomyNode): EconomyReport {
        val report = EconomyReport()
        consumptionNodeUpdateService.update(root, report)
        productionNodeUpdateService.update(root, report)
        reportMissingResources(root, report)
        return report
    }

    private fun reportMissingResources(root: EconomyNode, report: EconomyReport) {
        root.collectEntities()
            .filter { it.config.isActive }
            .filter { it.state.state == EconomyUpdateState.CONSUME }
            .forEach { report.addMissingResources(it, it.state.getRemainingRequired()) }
    }

}