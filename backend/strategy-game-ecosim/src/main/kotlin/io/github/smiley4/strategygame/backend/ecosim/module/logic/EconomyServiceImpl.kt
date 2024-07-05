package io.github.smiley4.strategygame.backend.ecosim.module.logic

import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNode.Companion.collectEntities
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyReport
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyService
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyUpdateState
import io.github.smiley4.strategygame.backend.ecosim.module.report.EconomyReportImpl

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

    private fun reportMissingResources(root: EconomyNode, report: EconomyReportImpl) {
        root.collectEntities()
            .filter { it.config.isActive }
            .filter { it.state.state == EconomyUpdateState.CONSUME }
            .forEach { report.addMissingResources(it, it.state.getRemainingRequired()) }
    }

}