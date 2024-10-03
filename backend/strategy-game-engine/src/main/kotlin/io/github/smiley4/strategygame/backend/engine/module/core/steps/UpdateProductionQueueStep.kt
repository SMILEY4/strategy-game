package io.github.smiley4.strategygame.backend.engine.module.core.steps

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.gen
import io.github.smiley4.strategygame.backend.commondata.Building
import io.github.smiley4.strategygame.backend.commondata.DetailLog
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueEntry
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.ecosim.edge.ConsumptionReportEntry
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyReport
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyReportEntry
import io.github.smiley4.strategygame.backend.engine.module.core.common.GameEventNode
import io.github.smiley4.strategygame.backend.engine.module.core.common.GameEventPublisher
import io.github.smiley4.strategygame.backend.engine.module.core.economy.entity.ProductionQueueEconomyEntity
import io.github.smiley4.strategygame.backend.engine.module.core.events.UpdatedEconomyEvent

internal class UpdateProductionQueueStep() : GameEventNode<UpdatedEconomyEvent>, Logging {

    override fun handle(event: UpdatedEconomyEvent, publisher: GameEventPublisher) {
        log().info("Updating production queues.")
        event.game.settlements.forEach { settlement ->
            settlement.infrastructure.productionQueue.firstOrNull()?.also { queueEntry ->
                update(event.game, event.report, settlement, queueEntry)
            }
        }
    }

    private fun update(game: GameExtended, report: EconomyReport, settlement: Settlement, queueEntry: ProductionQueueEntry) {
        updateCollectedResources(report, queueEntry)
        if (isCompleted(queueEntry)) {
            completeEntry(game, settlement, queueEntry)
        }
    }

    private fun updateCollectedResources(report: EconomyReport, queueEntry: ProductionQueueEntry) {
        report.getEntries()
            .findMatchingReportEntries(queueEntry)
            .forEach { reportEntry -> queueEntry.collectedResources.add(reportEntry.resources) }
    }

    private fun completeEntry(game: GameExtended, settlement: Settlement, queueEntry: ProductionQueueEntry) {
        log().info("Completing production queue entry ${queueEntry.id} in ${settlement.id}.")
        settlement.infrastructure.productionQueue.remove(queueEntry)
        when (queueEntry) {
            is ProductionQueueEntry.Settler -> {
                game.worldObjects.add(
                    WorldObject.Settler(
                        id = WorldObject.Id.gen(),
                        tile = settlement.tile,
                        country = settlement.country,
                        maxMovement = 3,
                        viewDistance = 1
                    )
                )
            }
            is ProductionQueueEntry.Building -> {
                settlement.infrastructure.buildings.add(
                    Building(
                        type = queueEntry.building,
                        workedTile = null, // todo
                        active = true,
                        details = DetailLog()
                    )
                )
            }
        }
    }

    private fun Collection<EconomyReportEntry>.findMatchingReportEntries(queueEntry: ProductionQueueEntry): List<ConsumptionReportEntry> {
        return this
            .filterIsInstance<ConsumptionReportEntry>()
            .filter { reportEntry ->
                reportEntry.entity is ProductionQueueEconomyEntity && (reportEntry.entity as ProductionQueueEconomyEntity).entry == queueEntry
            }
    }

    private fun isCompleted(queueEntry: ProductionQueueEntry): Boolean {
        return queueEntry.requiredResources.all { requiredType, requiredAmount ->
            queueEntry.collectedResources.hasAtLeast(requiredType, requiredAmount)
        }
    }

}