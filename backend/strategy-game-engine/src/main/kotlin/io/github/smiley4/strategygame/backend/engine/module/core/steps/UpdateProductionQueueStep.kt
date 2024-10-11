package io.github.smiley4.strategygame.backend.engine.module.core.steps

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.gen
import io.github.smiley4.strategygame.backend.commondata.Building
import io.github.smiley4.strategygame.backend.commondata.BuildingType
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
import io.github.smiley4.strategygame.backend.engine.module.core.common.send
import io.github.smiley4.strategygame.backend.engine.module.core.economy.entity.ProductionQueueEconomyEntity
import io.github.smiley4.strategygame.backend.engine.module.core.events.ProducedBuildingEvent
import io.github.smiley4.strategygame.backend.engine.module.core.events.ProducedSettlerEvent
import io.github.smiley4.strategygame.backend.engine.module.core.events.UpdatedEconomyEvent

internal class UpdateProductionQueueStep : GameEventNode<UpdatedEconomyEvent>,
    Logging {

    override fun handle(event: UpdatedEconomyEvent, publisher: GameEventPublisher) {
        log().info("Updating production queues.")
        event.game.settlements.forEach { settlement ->
            settlement.infrastructure.productionQueue.firstOrNull()?.also { queueEntry ->
                update(event.game, event.report, settlement, queueEntry, publisher)
            }
        }
    }

    private fun update(
        game: GameExtended,
        report: EconomyReport,
        settlement: Settlement,
        queueEntry: ProductionQueueEntry,
        publisher: GameEventPublisher
    ) {
        updateCollectedResources(report, queueEntry)
        if (isCompleted(queueEntry)) {
            completeEntry(game, settlement, queueEntry, publisher)
        }
    }

    private fun updateCollectedResources(report: EconomyReport, queueEntry: ProductionQueueEntry) {
        report.getEntries()
            .findMatchingReportEntries(queueEntry)
            .forEach { reportEntry -> queueEntry.collectedResources.add(reportEntry.resources) }
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

    private fun completeEntry(game: GameExtended, settlement: Settlement, queueEntry: ProductionQueueEntry, publisher: GameEventPublisher) {
        log().info("Completing production queue entry ${queueEntry.id} in ${settlement.id}.")
        settlement.infrastructure.productionQueue.remove(queueEntry)
        when (queueEntry) {
            is ProductionQueueEntry.Settler -> completeSettler(game, settlement, publisher)
            is ProductionQueueEntry.Building -> completeBuilding(game, settlement, queueEntry.building, publisher)
        }
    }

    private fun completeSettler(game: GameExtended, settlement: Settlement, publisher: GameEventPublisher) {
        val settler = WorldObject.Settler(
            id = WorldObject.Id.gen(),
            tile = settlement.tile,
            country = settlement.country,
            maxMovement = 3,
            viewDistance = 1
        )
        game.worldObjects.add(settler)
        publisher.send(ProducedSettlerEvent(game, settlement, settler))
    }

    private fun completeBuilding(game: GameExtended, settlement: Settlement, buildingType: BuildingType, publisher: GameEventPublisher) {
        val building = Building(
            type = buildingType,
            workedTile = null,
            active = false,
            details = DetailLog()
        )
        settlement.infrastructure.buildings.add(building)
        publisher.send(ProducedBuildingEvent(game, settlement, building))
    }

}