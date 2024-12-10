package io.github.smiley4.strategygame.backend.engine.application.core.process.steps

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.gen
import io.github.smiley4.strategygame.backend.commondata.Building
import io.github.smiley4.strategygame.backend.commondata.BuildingActivity
import io.github.smiley4.strategygame.backend.commondata.BuildingType
import io.github.smiley4.strategygame.backend.commondata.BuildingValidity
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueEntry
import io.github.smiley4.strategygame.backend.commondata.ResourceCollection
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.ecosim.lib.ConsumptionReportEntry
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyReport
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyReportEntry
import io.github.smiley4.strategygame.backend.engine.application.core.economy.entity.ProductionQueueEconomyEntity
import io.github.smiley4.strategygame.backend.engine.application.core.process.events.CreatedBuildingEvent
import io.github.smiley4.strategygame.backend.engine.application.core.process.events.EconomyUpdatedEvent
import io.github.smiley4.strategygame.backend.engine.application.core.process.system.ProcessEventPublisher
import io.github.smiley4.strategygame.backend.engine.application.core.process.system.ProcessStep

internal class UpdateProductionQueueStep(
    private val publisher: ProcessEventPublisher
) : ProcessStep<EconomyUpdatedEvent>,
    Logging {

    override suspend fun run(event: EconomyUpdatedEvent) {
        event.game.settlements.forEach { settlement ->
            settlement.infrastructure.productionQueue.firstOrNull()?.also { queueEntry ->
                update(event.game, event.report, settlement, queueEntry)
            }
        }
    }

    private suspend fun update(
        game: GameExtended,
        report: EconomyReport,
        settlement: Settlement,
        queueEntry: ProductionQueueEntry,
    ) {
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

    private suspend fun completeEntry(game: GameExtended, settlement: Settlement, queueEntry: ProductionQueueEntry) {
        log().info("Completing production queue entry ${queueEntry.id} in ${settlement.id}.")
        settlement.infrastructure.productionQueue.remove(queueEntry)
        when (queueEntry) {
            is ProductionQueueEntry.Settler -> completeSettler(game, settlement)
            is ProductionQueueEntry.Building -> completeBuilding(game, settlement, queueEntry.building)
        }
    }

    private fun completeSettler(game: GameExtended, settlement: Settlement) {
        val settler = WorldObject.Settler(
            id = WorldObject.Id.gen(),
            tile = settlement.tile,
            country = settlement.country,
            maxMovement = 3,
            viewDistance = 1
        )
        game.worldObjects.add(settler)
    }

    private suspend fun completeBuilding(game: GameExtended, settlement: Settlement, buildingType: BuildingType) {
        val building = Building(
            type = buildingType,
            workedTile = null,
            validity = BuildingValidity(
                workTile = false,
                inputResources = false
            ),
            activity = BuildingActivity(
                consumed = ResourceCollection.empty(),
                produced = ResourceCollection.empty(),
                missing = ResourceCollection.empty()
            )
        )
        settlement.infrastructure.buildings.add(building)
        publisher.publish(CreatedBuildingEvent(game, settlement, building))
    }

}