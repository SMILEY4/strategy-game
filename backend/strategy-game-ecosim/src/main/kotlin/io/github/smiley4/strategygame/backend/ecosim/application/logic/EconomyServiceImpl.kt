package io.github.smiley4.strategygame.backend.ecosim.application.logic

import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyNode.Companion.collectEntities
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyReport
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyService
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyUpdateState
import io.github.smiley4.strategygame.backend.ecosim.application.report.EconomyReportImpl

internal class EconomyServiceImpl(
    private val consumptionNodeUpdateService: ConsumptionNodeUpdateService,
    private val productionNodeUpdateService: ProductionNodeUpdateService
) : EconomyService {

    override fun update(root: EconomyNode): EconomyReport {
        val report = EconomyReportImpl()
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